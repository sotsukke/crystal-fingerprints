import { type Crystal, type Vec, cross, motifPositions, norm, reduce } from '../geometry/crystal'

/**
 * Layers that repeat with the lattice, painted on the GPU: each pixel is reduced into the cell and computed on its own,
 * so the cost depends on the number of pixels only, never on how many cells are in view or how much the balls overlap.
 * Each layer is its own WebGL canvas, and colours are written premultiplied by their alpha.
 */

/** Where the canvas sits in the world: the world position of its bottom-left corner, and one device pixel in units of length. */
export type Frame = { corner: Vec; unit: number }

type Rgb = [number, number, number]

const HEADER = `#version 300 es
precision highp float;
uniform vec2 corner;
uniform float unit;
uniform vec2 w1, w2;
uniform mat2 inv;
out vec4 color;
vec2 here() { return corner + gl_FragCoord.xy * unit; }
`

/** Closed balls of radius t around every point, shaded by how many contain the pixel's centre. */
const COVERAGE = `${HEADER}
uniform vec2 motif[3];
uniform int sites;
uniform float t;
uniform ivec2 reach;
uniform vec3 shades[6];
void main() {
  vec2 y = here();
  int count = 0;
  for (int m = 0; m < sites; m++) {
    vec2 f = floor(inv * (y - motif[m]));
    for (int i = -reach.x; i <= reach.x + 1; i++)
      for (int j = -reach.y; j <= reach.y + 1; j++)
        if (distance(y, motif[m] + (f.x + float(i)) * w1 + (f.y + float(j)) * w2) <= t) count++;
  }
  color = vec4(shades[min(count, 5)], 1.0);
}`

/** The lines of the cell's own basis, one pixel wide. */
const GRID = `${HEADER}
uniform vec2 v1, v2, origin;
uniform vec3 ink;
uniform float opacity;
void main() {
  vec2 d = here() - origin;
  float det = v1.x * v2.y - v1.y * v2.x;
  vec2 f = vec2(d.x * v2.y - d.y * v2.x, v1.x * d.y - v1.y * d.x) / det;
  vec2 gap = abs(f - round(f)) * abs(det) / vec2(length(v2), length(v1)) / unit;
  float a = clamp(1.0 - min(gap.x, gap.y), 0.0, 1.0);
  color = vec4(ink, 1.0) * a * opacity;
}`

/** Site a as filled squares, b as hollow squares, c as hollow diamonds, half-width h and stroke s in pixels. */
const DOTS = `${HEADER}
uniform vec2 motif[3];
uniform int sites;
uniform ivec2 reach;
uniform float h, s;
uniform vec3 ink, paper;
void main() {
  vec2 y = here();
  vec4 c = vec4(0.0);
  for (int m = 0; m < sites; m++) {
    vec2 f = floor(inv * (y - motif[m]));
    float d = 1e9;
    for (int i = -reach.x; i <= reach.x + 1; i++)
      for (int j = -reach.y; j <= reach.y + 1; j++) {
        vec2 q = abs(y - motif[m] - (f.x + float(i)) * w1 - (f.y + float(j)) * w2) / unit;
        d = min(d, m == 2 ? (q.x + q.y - 1.35 * h) / sqrt(2.0) : max(q.x, q.y) - h);
      }
    vec4 layer = m == 0
      ? vec4(ink, 1.0) * clamp(0.5 - d, 0.0, 1.0)
      : vec4(mix(paper, ink, clamp(0.5 + 0.5 * s - abs(d), 0.0, 1.0)), 1.0) * clamp(0.5 + 0.5 * s - d, 0.0, 1.0);
    c = layer + c * (1.0 - layer.a);
  }
  color = c;
}`

const compiled = new WeakMap<WebGL2RenderingContext, Map<string, WebGLProgram>>()

function program(gl: WebGL2RenderingContext, source: string): WebGLProgram {
  let programs = compiled.get(gl)
  if (!programs) {
    compiled.set(gl, (programs = new Map()))
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  }
  const known = programs.get(source)
  if (known) return known
  const shader = (type: number, text: string) => {
    const sh = gl.createShader(type)!
    gl.shaderSource(sh, text)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? 'shader')
    return sh
  }
  const p = gl.createProgram()!
  gl.attachShader(p, shader(gl.VERTEX_SHADER, '#version 300 es\nin vec2 at;\nvoid main() { gl_Position = vec4(at, 0.0, 1.0); }'))
  gl.attachShader(p, shader(gl.FRAGMENT_SHADER, source))
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'program')
  programs.set(source, p)
  return p
}

type Uniform = number | number[] | number[][] | Vec | Vec[] | { int: number | [number, number] } | { mat2: number[] }

/** Runs one shader over the whole canvas of `gl`. */
function run(gl: WebGL2RenderingContext, source: string, crystal: Crystal, frame: Frame, uniforms: Record<string, Uniform>) {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  const p = program(gl, source)
  gl.useProgram(p)
  const at = gl.getAttribLocation(p, 'at')
  gl.enableVertexAttribArray(at)
  gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0)
  const [w1, w2] = reduce(crystal.v1, crystal.v2)
  const det = cross(w1, w2)
  const all: Record<string, Uniform> = {
    corner: frame.corner,
    unit: frame.unit,
    w1,
    w2,
    inv: { mat2: [w2.y / det, -w1.y / det, -w2.x / det, w1.x / det] },
    ...uniforms,
  }
  for (const [name, value] of Object.entries(all)) {
    const loc = gl.getUniformLocation(p, name) ?? gl.getUniformLocation(p, `${name}[0]`)
    if (!loc) continue
    if (typeof value === 'number') gl.uniform1f(loc, value)
    else if ('int' in value) {
      if (typeof value.int === 'number') gl.uniform1i(loc, value.int)
      else gl.uniform2i(loc, ...value.int)
    } else if ('mat2' in value) gl.uniformMatrix2fv(loc, false, value.mat2)
    else if ('x' in value) gl.uniform2f(loc, value.x, value.y)
    else if (value.length && typeof value[0] === 'object' && 'x' in value[0]) gl.uniform2fv(loc, (value as Vec[]).flatMap((v) => [v.x, v.y]))
    else if (value.length && Array.isArray(value[0])) gl.uniform3fv(loc, (value as number[][]).flat())
    else gl.uniform3fv(loc, value as number[])
  }
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}

/** Lattice offsets to search on each side, in the reduced basis, so that every copy within r of a spot is visited. */
const reachOf = (crystal: Crystal, r: number): { int: [number, number] } => {
  const [w1, w2] = reduce(crystal.v1, crystal.v2)
  const det = Math.abs(cross(w1, w2))
  return { int: [Math.ceil((r * norm(w2)) / det), Math.ceil((r * norm(w1)) / det)] }
}

/** A colour in 0..255 as the shaders take it, in 0..1. */
const unit = (c: Rgb): number[] => c.map((u) => u / 255)

export function paintCoverage(gl: WebGL2RenderingContext, crystal: Crystal, frame: Frame, t: number, shades: Rgb[]) {
  run(gl, COVERAGE, crystal, frame, {
    motif: motifPositions(crystal),
    sites: { int: crystal.motif.length },
    t,
    reach: reachOf(crystal, t),
    shades: shades.map(unit),
  })
}

export function paintGrid(gl: WebGL2RenderingContext, crystal: Crystal, frame: Frame, ink: Rgb, opacity: number) {
  run(gl, GRID, crystal, frame, { v1: crystal.v1, v2: crystal.v2, origin: crystal.origin, ink: unit(ink), opacity })
}

/** Dots of half-width h pixels with strokes s pixels wide. */
export function paintDots(gl: WebGL2RenderingContext, crystal: Crystal, frame: Frame, h: number, s: number, ink: Rgb, paper: Rgb) {
  run(gl, DOTS, crystal, frame, {
    motif: motifPositions(crystal),
    sites: { int: crystal.motif.length },
    reach: reachOf(crystal, (1.35 * h + s) * frame.unit),
    h,
    s,
    ink: unit(ink),
    paper: unit(paper),
  })
}
