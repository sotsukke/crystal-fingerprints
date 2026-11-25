import { Algorithm, Defer, Definition, P, Phi, Psi, Question, V } from './blocks'
import { AtLeastFigure, DistanceFigure, GrowFigure, NearestFigure } from './live'
import { Static } from './static'

const Term = ({ children }: { children: string }) => <b className="term">{children}</b>

export function Course() {
  return (
    <article className="course">
      <h1 id="s0">Crystal density fingerprints</h1>

      <P n="0.1">
        Chemists now predict thousands of candidate crystals by computer, and they must check which predictions match the
        crystals they actually grow in the lab. To compare crystals, we need a mathematical description of one.
      </P>

      <Definition n="0.2" plural aside={<Static ids={['0.2-lattice']} />}>
        <p>
          The <Term>lattice</Term> Λ of a basis <V i={1} />, <V i={2} />, two linearly independent vectors, is the set of all
          points <i>i</i> <V i={1} /> + <i>j</i> <V i={2} /> with <i>i</i> and <i>j</i> integers.
        </p>
        <p>
          The <Term>unit cell</Term> <i>U</i> of a basis <V i={1} />, <V i={2} /> is the parallelogram of all combinations of{' '}
          <V i={1} /> and <V i={2} /> with coefficients in [0, 1).
        </p>
        <p>
          A <Term>motif</Term> <i>M</i> is a finite set of points in a unit cell.
        </p>
        <p>
          The <Term>periodic set</Term> of a motif <i>M</i> is <i>S</i> = <i>M</i> + Λ, a copy of <i>M</i> at every point of Λ.
        </p>
      </Definition>

      <P n="0.3">
        So we can store a crystal as a file that lists a basis and the coordinates of the motif. The first problem is that
        one crystal has infinitely many such files.
      </P>
      <Static ids={['0.3-another-basis', '0.3-a-shifted-origin', '0.3-a-cell-twice-as']} />

      <P n="0.4" aside={<Static ids={['0.4-a-point-at-each', '0.4-the-centre-points-nudged']} />}>
        The second problem is that a tiny perturbation of the points can change the file completely, and the points of a
        real crystal are always slightly perturbed, because atoms vibrate and are measured with small errors.
      </P>

      <P n="0.5">
        To solve the first problem, we want a description of a crystal that does not depend on the chosen basis, unit cell
        or origin, and that stays the same under rigid motions of the crystal. We will call this description the
        fingerprint. To solve the second, we also want the fingerprint to be continuous, meaning that points that move a
        little change the fingerprint only a little.
      </P>

      <h2 id="s1">The density fingerprint</h2>

      <P n="1.1" aside={<Static ids={['1.1-a-periodic-set', '1.1-the-same-set-turned']} />}>
        Rigid motions keep all distances between points, so a fingerprint should be built from distances only. We draw a
        ball around every point and measure how much of the plane is covered once, twice, and so on.
      </P>

      <Definition n="1.2" aside={<Static ids={['1.3-closed-ball']} />}>
        <p>
          The <Term>closed ball</Term> <i>B</i>(<i>p</i>, <i>t</i>) of radius <i>t</i> around a point <i>p</i> is the set
          of all spots at distance at most <i>t</i> from <i>p</i>.
        </p>
      </Definition>

      <Definition n="1.3" plural aside={<Static ids={['1.3-packing-radius', '1.3-covering-radius']} />}>
        <p>
          The <Term>packing radius</Term> <i>r</i> of a periodic set is half the smallest distance between two of its
          points. Up to radius <i>r</i>, no two balls share any area.
        </p>
        <p>
          The <Term>covering radius</Term> <i>R</i> of a periodic set is the largest distance from a spot of the plane to
          its nearest point. From radius <i>R</i> on, the balls cover the whole plane.
        </p>
      </Definition>

      <Question
        n="1.4"
        kind="dissonance"
        ask={
          <>
            Draw a closed ball of radius <i>t</i> around every spot of the plane, instead of around the points. For which{' '}
            <i>t</i> does every one of these balls contain a point?
          </>
        }
        answer={
          <>
            Exactly from <i>R</i> on. A spot <i>y</i> and a point <i>p</i> are at distance at most <i>t</i> exactly when
            the ball around <i>y</i> contains <i>p</i>, and also exactly when the ball around <i>p</i> contains <i>y</i>. So
            every ball around a spot contains a point exactly when the balls around the points cover the whole plane.
            <Static ids={['1.4-t-0.35-3-balls', '1.4-t-0.71-every-ball', '1.4-balls-of-radius-0.71']} />
          </>
        }
      />

      <P n="1.5">
        Now we grow all the balls together. As the radius grows, more of the plane is covered, and by more balls at once.
        We plot, against the radius, the share of a unit cell covered once, twice, and so on. Together these curves are
        the fingerprint.
      </P>
      <Defer height={560}>
        <GrowFigure />
      </Defer>

      <Definition n="1.6" plural>
        <p>
          The <Term>coverage number</Term> <i>k</i> of a spot at radius <i>t</i> is the number of points of the periodic set
          whose closed ball of radius <i>t</i> contains the spot.
        </p>
        <p>
          The <Term>density function</Term> <Psi /> of a periodic set sends each radius <i>t</i> to the share of a unit
          cell whose spots have coverage number <i>k</i> at radius <i>t</i>.
        </p>
        <p>
          The <Term>density fingerprint</Term> Ψ of a periodic set is the sequence (<Psi k={0} />, <Psi k={1} />,{' '}
          <Psi k={2} />, …).
        </p>
      </Definition>

      <Question
        n="1.7"
        ask={
          <>
            What do the packing radius <i>r</i> and the covering radius <i>R</i> tell us about Ψ?
          </>
        }
        answer={
          <>
            Up to <i>r</i>, no spot is covered twice, so <Psi k={2} />, <Psi k={3} />, … are 0 and <Psi k={1} />(
            <i>t</i>) = <i>m</i>π<i>t</i>² / area(<i>U</i>) for a unit cell <i>U</i> with <i>m</i> points. From <i>R</i>{' '}
            on, no spot is left uncovered, so <Psi k={0} /> is 0. In the square lattice of 1.5, <i>r</i> = 0.5 and{' '}
            <i>R</i> ≈ 0.71: <Psi k={2} /> starts at 0.5 and <Psi k={0} /> reaches 0 at 0.71.
          </>
        }
      />

      <Question
        n="1.8"
        ask="Why does Ψ not depend on the file we start from, and why does a rigid motion of the crystal leave it unchanged?"
        answer="Ψ is computed from the periodic set alone, not from the basis or the origin. The coverage numbers repeat with the lattice, so every unit cell, of any basis of the crystal, holds the same share of each coverage number. A rigid motion carries the balls along with the points, so every coverage number, and every share, stays the same."
      />

      <h2 id="s2">Computing the fingerprint</h2>

      <P n="2.1">
        The fingerprint asks for the share of a unit cell <i>U</i> covered by exactly <i>k</i> balls, as a function of the
        radius <i>t</i>. We’ll do this here for <i>k</i> = 2.
        <span className="display">
          <Psi />(<i>t</i>) ={' '}
          <span className="frac">
            <span>
              area {'{'} <i>y</i> ∈ <i>U</i> : #{'{'} <i>p</i> ∈ <i>S</i> : |<i>y</i> − <i>p</i>| ≤ <i>t</i> {'}'} ={' '}
              <i>k</i> {'}'}
            </span>
            <span>
              area(<i>U</i>)
            </span>
          </span>
        </span>
        Problem: this formula asks us to check, for infinitely many spots, which points are within distance <i>t</i>.
        But notice that a spot <i>y</i> is covered at least twice if <i>t</i> is at least the distance from <i>y</i> to its 2nd nearest
        point of <i>S</i>. So instead, we’ll try to find the 2nd nearest point of each spot.
      </P>
      <Defer height={560}>
        <NearestFigure />
      </Defer>


      <h3>Brillouin zones</h3>
      <P n="2.2">
        Let’s flip it: where is <i>p</i> the 2nd nearest? A spot is nearer to <i>q</i> than to <i>p</i> when it’s on{' '}
        <i>q</i>’s side of their bisector. So we count the bisectors between the spot and <i>p</i>. Here <i>y</i> has two,
        so <i>p</i> is its 3rd nearest.
      </P>
      <Static ids={['2.3-nearer-to-q', '2.3-zone-3-of-p']} />

      <Definition n="2.3">
        <p>
          The <i>k</i>-th <Term>Brillouin zone</Term> <i>Z</i>
          <sub>k</sub>(<i>p</i>) of a point <i>p</i> of a set <i>S</i> is the set of spots <i>y</i> whose open ball of
          radius |<i>y</i> − <i>p</i>| contains exactly <i>k</i> − 1 points of <i>S</i>: the spots whose <i>k</i>-th
          nearest point is <i>p</i>.
        </p>
      </Definition>

      <Question
        n="2.4"
        kind="dissonance"
        ask="In the square lattice of spacing 1, what is the area of the 10th Brillouin zone of a point?"
        answer={
          <>
            <p>
              Exactly 1, the area of one cell, and the same holds for every <i>k</i>. Nothing here depends on the square,
              so the figures use a skewed lattice.
            </p>
            <p>
              The 10th zone of a point is where that point is the 10th nearest. Every spot has exactly one 10th nearest
              point, since ties happen only on lines and lines have no area. So the 10th zones of all the points tile the
              plane, with no gaps and no overlaps. The lattice looks the same from each of its points, so every tile has
              the same shape, only shifted.
            </p>
            <Static ids={['2.5-zone-of-p', '2.5-tiling']} />
            <p>
              That leaves one tile per point, and one point per cell. A huge region of <i>N</i> cells holds about{' '}
              <i>N</i> points, and their tiles fill it. A tile can be scattered in pieces, but each piece stays near its
              point, so only the tiles at the edge of the region stick out or leave holes, and their share shrinks to
              nothing as the region grows. So each tile has the area of one cell.
            </p>
          </>
        }
      />

      <Question
        n="2.5"
        ask="The square lattice has one point per cell. With two points per cell, does each 3rd Brillouin zone still have the area of one cell?"
        answer={
          <>
            No. Every spot still has exactly one 3rd nearest point, so the 3rd zones of the two motif points together
            fill one cell. Each fills exactly half, since a half-turn about the midpoint of the two points maps the set onto
            itself and swaps the two zones. With three points per cell, the three areas can differ.
          </>
        }
      />

      <h3>Zones inside balls</h3>
      <P n="2.6" aside={<Static ids={['2.7-ball-b-p-t']} />}>
        Back to <Psi k={2} />. Every spot in zone 2 of <i>p</i> has <i>p</i> as its 2nd nearest point. So it’s covered at
        least twice exactly when it’s inside the ball around <i>p</i>.
      </P>


      <P n="2.7">
        But <Psi k={2} /> wants exactly twice. That’s at least twice minus at least three times, so we need zone 3 too.
      </P>
      <Defer height={360}>
        <AtLeastFigure />
      </Defer>

      <Definition n="2.8">
        <p>
          The <Term>cumulative density</Term> <Phi /> of a periodic set sends each radius <i>t</i> to the share of a cell
          made of spots with coverage number at least <i>k</i> at radius <i>t</i>.
        </p>
        <p className="display">
          <Psi />(<i>t</i>) = <Phi />(<i>t</i>) − <Phi k="k+1" />(<i>t</i>)
        </p>
      </Definition>
      <P n="2.9" aside={<Static ids={['2.11-the-points-within-2t']} />}>
        Zones still seem to depend on infinitely many bisectors. But we only need them inside the ball, and the bisector
        with a point at distance <i>d</i> is <i>d</i>/2 away from <i>p</i>. So only the points within 2<i>t</i> matter.
      </P>

      <h3>The area of a zone inside a ball</h3>
      <P n="2.10" aside={<Static ids={['2.12-a-walk-from-p']} />}>
        A zone can be scattered in pieces, so how do we measure it inside the ball? Walk straight out from <i>p</i>. Every
        bisector you cross adds one nearer point, for good. So you pass zones 1, 2, 3 in order.
      </P>

      <P n="2.11">
        So zones 1 to <i>k</i> fill whatever the walks reach before their <i>k</i>-th crossing or the circle. Turning the
        walk around <i>p</i>, its end sweeps triangles along bisectors and sectors along the circle. It only switches where
        two bisectors cross or a bisector hits the circle.
      </P>
      <Static ids={['2.13-zones-1-to-2-in-the-ball', '2.13-one-bisector']} />

      <P n="2.12">
        Zone <i>k</i> is then zones 1 to <i>k</i> minus zones 1 to <i>k</i> − 1. For <Psi k={2} />, that’s zones 1 to 2
        minus zone 1.
      </P>
      <Static ids={['2.14-zone-1-in-the-ball', '2.14-zone-2-in-the-ball']} />

      <Algorithm
        n="2.13"
        title={
          <>
            Compute <Psi k={0} />(<i>t</i>), <Psi k={1} />(<i>t</i>), … of a periodic set <i>S</i> at a radius <i>t</i>
          </>
        }
      >
        <ol>
          <li>For each motif point <i>p</i>, collect the points of <i>S</i> within 2<i>t</i> of <i>p</i>.</li>
          <li>Draw the bisectors of <i>p</i> and those points.</li>
          <li>
            Cut the directions around <i>p</i> at the crossings of two bisectors inside the ball of radius <i>t</i>, and at
            the points where a bisector meets the circle.
          </li>
          <li>
            For each <i>k</i>, add up over the wedges the triangle or sector that zones 1 to <i>k</i> fill, and subtract the
            same sum for <i>k</i> − 1. This is the area of zone <i>k</i> inside the ball.
          </li>
          <li>
            Sum these areas over the motif and divide by the area of <i>U</i> to get <Phi />(<i>t</i>), then take
            differences to get <Psi />(<i>t</i>).
          </li>
        </ol>
      </Algorithm>
      <Static ids={['2.15-1-points-within-2t', '2.15-2-their-bisectors', '2.15-3-wedges']} />
      <Static ids={['2.15-4-zone-2-in-the-ball', '2.15-5-phi2']} />


      <h2 id="s3">Continuity and completeness</h2>
      <h3>Continuity</h3>

      <P n="3.1">
        Let’s turn to the second problem from the introduction. A tiny perturbation of the points can change a crystal
        file completely, and we want it to change the fingerprint only a little. To make “a little” precise, we need to
        measure how far the points have moved and how far apart the two fingerprints are.
      </P>
      <P n="3.2" aside={<Static ids={['3.2-each-point-with-its', '3.2-another-pairing-longest-arrow']} />}>
        To measure how far the points have moved, we pair each point of one set with one point of the other and look at
        the longest arrow.
      </P>

      <Definition n="3.3" plural>
        <p>
          A <Term>matching</Term> of two point sets is a pairing that joins each point of one set to exactly one point of
          the other by an arrow, and uses each point of the other set exactly once.
        </p>
        <p>
          The <Term>bottleneck distance</Term> of two point sets is the smallest length that the longest arrow of a
          matching of the two sets can have.
        </p>
      </Definition>

      <P n="3.4">
        To measure how far apart two fingerprints are, we compare their curves for the same <i>k</i>.
      </P>
      <Defer height={460}>
        <DistanceFigure />
      </Defer>

      <Definition n="3.5">
        <p>
          The <Term>fingerprint distance</Term> of two periodic sets is the largest, over all <i>k</i>, of the largest
          vertical gap between their <Psi /> curves divided by √(<i>k</i> + 1).
        </p>
      </Definition>

      <Question
        n="3.6"
        ask="Is the fingerprint continuous, meaning that a small bottleneck distance always gives a small fingerprint distance?"
        answer={
          <>
            Yes, as long as each point moves by less than the packing radius <i>r</i>. Moving one point by{' '}
            <i>δ</i> changes coverage only in a crescent of width at most <i>δ</i>, so the fingerprint distance is at most
            a constant times <i>δ</i>.
          </>
        }
      />
      <Static ids={['3.6-ball-before']} />

      <h3>Completeness</h3>
      <Question
        n="3.7"
        ask="One crystal always gets one fingerprint, and nearby crystals get nearby fingerprints. But is the fingerprint complete, meaning that two different crystals always get different fingerprints?"
        answer="Not always, but it is for almost every crystal."
      />

      <P n="3.8" aside={<Static ids={['3.8-t-0.24-two-balls', '3.8-t-0.52-three-balls']} />}>
        Notice that each density function follows one formula between certain radii and switches to another where balls
        start to overlap in a new way. These radii are half the distance between two points, or the circumradius of three
        points, the radius of the circle through them.
      </P>
      <Static ids={['3.8-two-balls-touch-0.24']} />

      <P n="3.9" aside={<Static ids={['3.9-part-of-the-list', '3.9-triangles-whose-circumradius-is', '3.9-glued-edge-to-edge']} />}>
        So from the radii where the formulas change, we can rebuild the triangles of points and glue them into the motif
        and the lattice.
      </P>
      <P n="3.10" aside={<Static ids={['3.10-ob-bc-0.80-the', '3.10-the-same-triangle-glued']} />}>
        Problem: two pairs or triples of points can share a circumradius, and then more than one gluing fits.
      </P>

      <Definition n="3.11">
        <p>
          A periodic set is <Term>generic</Term> when, among its pairs and triples of points up to a fixed size, no two have
          the same circumradius and no two pairs have circumradii in ratio 2, except where the repetition of the set forces
          it. Also, no three of its circumradii, doubled, form a triangle whose circumradius is on its list unless
          that triangle is one of its own.
        </p>
      </Definition>

      <P n="3.12">
        Almost every periodic set is generic, so the fingerprint is complete for almost every crystal. For the others it
        can fail.
      </P>
      <Static ids={['3.12-a-0-1-3']} />
      <Static ids={['3.12-their-density-functions-coincide']} />
    </article>
  )
}
