import type { ReactNode } from 'react'
import { Algorithm, Definition, P, Phi, Psi, Question } from '../course/blocks'
import { staticFigures } from '../course/static'
import index from './figures/index.json'

const Static = staticFigures(
  index,
  import.meta.glob<string>('./figures/*.svg', { eager: true, query: '?raw', import: 'default' }),
)

const Term = ({ children }: { children: string }) => <b className="term">{children}</b>

/** The average over draws, E. */
const E = ({ children }: { children: ReactNode }) => <>E{' '}{children}</>

/** A part of a formula with an underbrace and the label naming what it maps to. */
const Gloss = ({ label, children }: { label: ReactNode; children: ReactNode }) => (
  <span className="gloss">
    <span>{children}</span>
    <small>{label}</small>
  </span>
)

const Frac = ({ top, bottom }: { top: ReactNode; bottom: ReactNode }) => (
  <span className="frac">
    <span>{top}</span>
    <span>{bottom}</span>
  </span>
)

const U = () => (
  <>
    |<i>U</i>|
  </>
)

export function Expected() {
  return (
    <article className="course">
      <h1 id="x0">Expected fingerprints of disordered crystals</h1>

      <p className="course-note">
        This follow-up course was written by my raphael2 course-writing skill stack. I tuned that stack by evaluating it
        against my own reference course, the density fingerprints course: the evaluations ran on their own, and I directed the
        changes to the stack after each round. This course is the output of the last round. I did not write or edit it
        myself, and I have not been able to understand all of it yet. I added it here because I thought it was cool to share.
      </p>

      <P n="0.1">
        Two labs measured one material, whose atoms sit on the square lattice of spacing 1, and wrote two crystal files with
        different cells. In both files, every motif point holds an atom in only about half of the cells. To compare the files
        by density functions, each lab needs one periodic set. So each lab fills a block of cells by tossing a coin for every
        copy of a motif point, repeats the block in every direction, and computes the density functions.
      </P>
      <Static ids={['00-1-1', '00-1-2']} />

      <P n="0.2">
        So the fingerprint distance between the two labs’ density functions is not zero. The labs cannot tell whether their
        files describe one crystal.
      </P>

      <Definition n="0.3" plural>
        <p>
          A <Term>site</Term> of a crystal file is a point of its periodic set: a motif point moved by a lattice vector.
        </p>
        <p>
          The <Term>occupancy</Term> <i>p</i> of a site is the chance that the site holds an atom. The file gives one
          occupancy for each motif point, shared by all its sites.
        </p>
        <p>
          A <Term>draw</Term> of a crystal file is the periodic set we get by tossing one coin for every site of a block of
          cells and repeating the kept sites of the block in every direction. Each coin keeps its site with chance the site’s
          occupancy, independently of the other coins.
        </p>
      </Definition>

      <P n="0.4">
        The first problem is that every draw of a file is a different periodic set with different density functions, so the
        file itself has no density functions. To solve it, we want one set of curves that the file fixes, the same for every
        lab, because only such curves can show that two files describe one crystal.
      </P>

      <P n="0.5">
        The second problem is that averaging over many draws only estimates such curves, and every draw is a new periodic set
        whose Brillouin zones must be computed again. To solve it, we also want to compute the curves exactly from the crystal
        with every site present, whose geometry we compute once, because one exact computation then serves every occupancy
        and leaves no sampling error.
      </P>

      <h2 id="x1">One set of curves for a crystal file</h2>

      <P n="1.1">
        Since every draw of the file has its own density functions, what one set of curves could still belong to the file?
      </P>
      <Static ids={['01-1']} />

      <P n="1.2">
        For every block size the draws scatter around one value, and the bigger the block, the closer each draw lands to it.
        The value depends only on the chances of the coins, which the file gives.
      </P>

      <Definition n="1.3" plural>
        <p>
          The <Term>expected density function</Term>{' '}
          <E>
            <Psi />
          </E>{' '}
          of a crystal file sends each radius <i>t</i> to the average of <Psi />(<i>t</i>) over the draws of the file.
        </p>
        <p>
          The <Term>expected fingerprint</Term> of a crystal file is the list of its expected density functions{' '}
          <E>
            <Psi k={0} />
          </E>
          ,{' '}
          <E>
            <Psi k={1} />
          </E>
          , ….
        </p>
      </Definition>

      <P n="1.4">
        To compute the average, notice that <Psi />(<i>t</i>) of one draw is itself an average over spots: the share of spots
        with coverage number <i>k</i>. So the average of <Psi />(<i>t</i>) over draws is the average over spots of the chance
        that a spot has coverage number <i>k</i> in a draw.
      </P>
      <Static ids={['01-2-1', '01-2-2']} />

      <P n="1.5">
        At radius <i>t</i> we write <i>N</i>
        <sub>t</sub>(<i>y</i>) for the number of kept sites within <i>t</i> of <i>y</i>. The chances of <i>N</i>
        <sub>t</sub>(<i>y</i>) repeat from cell to cell of the file, so the average over the spots of a block is the average
        over one cell <i>U</i>:
        <span className="display">
          <E>
            <Psi />
          </E>
          (<i>t</i>) ={' '}
          <Gloss label="average over the cell">
            <Frac top="1" bottom={<U />} /> ∫<sub>U</sub>
          </Gloss>{' '}
          <Gloss
            label={
              <>
                chance that exactly <i>k</i> coins of <i>y</i> come up kept
              </>
            }
          >
            P(<i>N</i>
            <sub>t</sub>(<i>y</i>) = <i>k</i>)
          </Gloss>{' '}
          <i>dy</i> .
        </span>
      </P>

      <Question
        n="1.6"
        ask={
          <>
            The density function <Psi k={0} /> of the square lattice is zero from the covering radius on. With every site at
            occupancy 1/2, from which radius on is the expected density function{' '}
            <E>
              <Psi k={0} />
            </E>{' '}
            zero?
          </>
        }
        answer={
          <>
            From no radius: a spot stays uncovered when the finitely many sites within <i>t</i> of it are all missing, which
            has a positive chance at every radius, so the expected density functions never end by themselves and are computed
            up to a chosen largest radius.
          </>
        }
      />
      <Static ids={['01-3-1', '01-3-2']} />

      <Question
        n="1.7"
        ask="The two labs’ files list different cells of one crystal. Do they get the same expected density functions?"
        answer="Yes: the chance at a spot depends only on the distances from the spot to the sites and on their occupancies, which a change of cell or a rigid motion keeps."
      />
      <Static ids={['01-4-1', '01-4-2']} />

      <P n="1.8">
        A site that always holds an atom, but of one of two kinds, leaves the point set unchanged, so the site counts at
        occupancy 1 and the expected fingerprint does not see that kind of disorder.
      </P>

      <h2 id="x2">Expected curves from the density functions</h2>

      <P n="2.1">
        The problem is that the chance of exactly <i>k</i> kept sites changes from spot to spot, and the average over the cell
        needs it at every spot.
      </P>
      <Static ids={['02-1']} />

      <P n="2.2">
        Notice, though, that the two spots under two balls have their sites in different places and the same chance. With one
        occupancy <i>p</i> for every site, the chance that a spot keeps exactly <i>k</i> of its covering balls depends only on
        how many balls of the full crystal, with every site present, cover it. So we want the expected density functions from
        the density functions of the full crystal, which we compute once from the Brillouin zones.
        <span className="display">
          <E>
            <Psi />
          </E>
          (<i>t</i>) = Σ<sub>n ≥ k</sub>{' '}
          <Gloss
            label={
              <>
                chance that <i>k</i> of <i>n</i> covering sites are kept
              </>
            }
          >
            <span className="binom">
              <i>n</i>
              <i>k</i>
            </span>{' '}
            <i>p</i>
            <sup>k</sup> (1 − <i>p</i>)<sup>n−k</sup>
          </Gloss>{' '}
          <Gloss
            label={
              <>
                share shaded as covered <i>n</i> times
              </>
            }
          >
            <Psi k="n" />(<i>t</i>)
          </Gloss>
        </span>
      </P>

      <P n="2.3">
        The binomial factors fill a table of weights, one row per number of covering sites. We never need a binomial
        coefficient, because one more covering site is either missing or kept.
      </P>
      <Static ids={['02-2']} />
      <p className="display">
        <i>w</i>(<i>n</i>, <i>k</i>) ={' '}
        <Gloss
          label={
            <>
              arrow down: the <i>n</i>-th site missing
            </>
          }
        >
          (1 − <i>p</i>) <i>w</i>(<i>n</i> − 1, <i>k</i>)
        </Gloss>{' '}
        +{' '}
        <Gloss
          label={
            <>
              arrow down and right: the <i>n</i>-th site kept
            </>
          }
        >
          <i>p</i> <i>w</i>(<i>n</i> − 1, <i>k</i> − 1)
        </Gloss>
        , &emsp; <i>w</i>(0, 0) = 1
      </p>

      <Question
        n="2.4"
        ask={
          <>
            With every site at occupancy 1/2, we want only the expected empty share{' '}
            <E>
              <Psi k={0} />
            </E>
            , at a radius far past the covering radius. Which density functions must we compute?
          </>
        }
        answer={
          <>
            Every <Psi k="n" /> from the fewest to the most balls covering a spot at that radius, and not <Psi k={0} />, which
            is zero there. A spot covered by <i>n</i> balls keeps none of them with chance (1 − <i>p</i>)<sup>n</sup>, so the
            Brillouin zones go as deep as the most balls covering a spot at the largest radius, however small <i>k</i> is.
          </>
        }
      />
      <Static ids={['02-3']} />

      <P n="2.5">So we fix the largest radius before we compute anything.</P>

      <Algorithm n="2.6" title="Expected density functions with one occupancy">
        <ol>
          <li>
            Choose the largest radius <i>T</i>, and find the most balls of radius <i>T</i> that cover one spot: compute the
            cumulative density <Phi />(<i>T</i>) for <i>k</i> = 1, 2, … until it is zero, and take the last <i>k</i> before
            that.
          </li>
          <li>
            Compute the density functions up to that number, at every radius up to <i>T</i>, from Brillouin zones one deeper.
          </li>
          <li>Fill the table of weights down to that row and across to the last expected density function wanted.</li>
          <li>
            At each radius up to <i>T</i>, sum the weights times the density functions.
          </li>
        </ol>
      </Algorithm>
      <Static ids={['02-4-1', '02-4-2', '02-4-3', '02-4-4']} />

      <Question
        n="2.7"
        kind="try"
        ask={
          <>
            For the crystal with a square cell of side 1 and motif points (0, 0) and (½, ¼), every site at occupancy 0.3,
            compute{' '}
            <E>
              <Psi k={0} />
            </E>{' '}
            to{' '}
            <E>
              <Psi k={2} />
            </E>{' '}
            at radius 0.4 by hand from the density functions of that crystal, then in code for all radii up to 1.
          </>
        }
        answer={
          <>
            At <i>t</i> = 0.4, balls overlap only between points √5/4 ≈ 0.559 apart, in two lenses of area 0.095 per cell, so
            no spot is covered three times and the density functions are <Psi k={0} /> = 0.185, <Psi k={1} /> = 0.625 and{' '}
            <Psi k={2} /> = 0.190. The table of weights at <i>p</i> = 0.3 has rows 1; 0.7, 0.3; and 0.49, 0.42, 0.09. So{' '}
            <E>
              <Psi k={0} />
            </E>{' '}
            = <Psi k={0} /> + 0.7 <Psi k={1} /> + 0.49 <Psi k={2} /> = 0.716,{' '}
            <E>
              <Psi k={1} />
            </E>{' '}
            = 0.3 <Psi k={1} /> + 0.42 <Psi k={2} /> = 0.267 and{' '}
            <E>
              <Psi k={2} />
            </E>{' '}
            = 0.09 <Psi k={2} /> = 0.017. In code, with <i>T</i> = 1, the most balls of radius 1 covering one spot is 8, so
            the density functions run up to <Psi k={8} />; the curves meet the hand values on the dashed line at 0.4:
            <Static ids={['02-5']} />
          </>
        }
      />

      <h2 id="x3">Chances that depend on the classes</h2>

      <P n="3.1">
        A crystal file gives each motif point an occupancy of its own, so we also want the expected density functions when the
        occupancies differ. Take the checkerboard, the square lattice whose sites (<i>i</i>, <i>j</i>) with <i>i</i> +{' '}
        <i>j</i> even have occupancy 0.9 and whose other sites have 0.2. Its cell holds two motif points, <i>a</i> at 0.9 and{' '}
        <i>b</i> at 0.2. Two spots A and B of the checkerboard are each covered by three balls of radius 0.8. Is the chance
        that exactly one of the three survives the same at both spots?
      </P>
      <Static ids={['03-1-1', '03-1-2']} />

      <P n="3.2">
        The two spots sit at the same distances from their three covering sites, and only the occupancies of those sites
        differ.
      </P>

      <Definition n="3.3">
        <p>
          An <Term>occupancy class</Term> of a crystal file is a set of its motif points that share one occupancy, and a site
          belongs to the class of its motif point. On the checkerboard, <i>a</i> is in the first class and <i>b</i> in the
          second.
        </p>
      </Definition>
      <Static ids={['03-2']} />

      <P n="3.4">
        The table of weights still computes the chance at a spot, because each added site is either missing or kept whatever
        its occupancy, so we add the covering sites one at a time, each with its own occupancy. The entry for one kept site in
        the last row is the chance at spot B, reached without listing which site survives. Adding a site <i>x</i> with
        occupancy <i>p</i>
        <sub>x</sub> turns the row <i>w</i> before it into the row <i>w</i>
        <sub>x</sub> after it:
        <span className="display">
          <i>w</i>
          <sub>x</sub>(<i>j</i>) ={' '}
          <Gloss
            label={
              <>
                arrow down: <i>x</i> missing
              </>
            }
          >
            (1 − <i>p</i>
            <sub>x</sub>) <i>w</i>(<i>j</i>)
          </Gloss>{' '}
          +{' '}
          <Gloss
            label={
              <>
                arrow down and right: <i>x</i> kept
              </>
            }
          >
            <i>p</i>
            <sub>x</sub> <i>w</i>(<i>j</i> − 1)
          </Gloss>
        </span>
      </P>

      <Question
        n="3.5"
        ask="A spot is covered by many sites of each occupancy class. Do its weights change with the order in which we add its covering sites to the table?"
        answer="No: each row is the chance of each number of survivors among the sites added so far, which does not depend on their order, so the weights depend only on how many covering sites come from each occupancy class."
      />
      <Static ids={['03-3']} />

      <P n="3.6">What we still lack is the share of the cell covered by each number of sites from each occupancy class.</P>

      <h2 id="x4">Labelled faces around each motif point</h2>

      <P n="4.1">
        The problem is that the density functions record only how many balls cover a region, not of which occupancy classes.
        Notice, though, that the Brillouin zones of a motif point <i>a</i> split the plane by how many sites are nearer than{' '}
        <i>a</i>, and a spot within <i>t</i> of <i>a</i> is covered at least <i>k</i> times with <i>a</i> as its <i>k</i>-th
        nearest site exactly when it lies in the <i>k</i>-th Brillouin zone of <i>a</i>. So we want the same split around{' '}
        <i>a</i>, with the nearer sites counted per occupancy class and kept sites in place of sites.
      </P>

      <P n="4.2" aside={<Static ids={['04-1']} />}>
        In this draw the three sites nearer to the spot <i>y</i> than <i>a</i> are missing and <i>a</i> is kept, so <i>a</i> is
        the first kept site of <i>y</i>. Had exactly one of the three been kept, <i>a</i> would be the second kept site of{' '}
        <i>y</i>.
      </P>
      <p className="display">
        P(<i>a</i> is the <i>k</i>-th nearest kept site of <i>y</i>) ={' '}
        <Gloss
          label={
            <>
              the coin of <i>a</i>
            </>
          }
        >
          <i>p</i>
          <sub>a</sub>
        </Gloss>{' '}
        ·{' '}
        <Gloss
          label={
            <>
              the coins of the sites numbered before <i>a</i>
            </>
          }
        >
          P(exactly <i>k</i> − 1 of the sites nearer to <i>y</i> than <i>a</i> are kept)
        </Gloss>
      </p>

      <Question
        n="4.3"
        ask={
          <>
            On the checkerboard with largest radius <i>T</i> = 0.9, we want only{' '}
            <E>
              <Psi k={0} />
            </E>
            . Which sites around the motif point <i>a</i> must we collect?
          </>
        }
        answer={
          <>
            Every site within 2<i>T</i> of <i>a</i>, the same for every <i>k</i>: <i>a</i> is the first kept site of a spot{' '}
            <i>y</i> whenever every site nearer to <i>y</i> than <i>a</i> is missing, and a site nearer than <i>a</i> to a
            spot within <i>T</i> of <i>a</i> lies inside the disk centred at the spot through <i>a</i>, so within 2<i>T</i> of{' '}
            <i>a</i>.
          </>
        }
      />

      <P n="4.4" aside={<Static ids={['04-2']} />}>
        The disk of <i>y</i> reaches farthest from <i>a</i> at the point opposite <i>a</i>, on the circle of radius 2
        <i>T</i>, so on the checkerboard we collect the eight sites inside that circle.
      </P>

      <Definition n="4.5">
        <p>
          A <Term>candidate</Term> of a motif point <i>a</i>, for a largest radius <i>T</i>, is a site other than <i>a</i>{' '}
          within 2<i>T</i> of <i>a</i>.
        </p>
      </Definition>

      <P n="4.6">
        Which sites are nearer than <i>a</i> changes only where a spot crosses the bisector of <i>a</i> and a candidate, so the
        bisectors cut the plane into pieces on which every spot has the same nearer sites.
      </P>

      <P n="4.7" aside={<Static ids={['04-3']} />}>
        Crossing the bisector of <i>a</i> and a candidate of the second occupancy class adds one to the second count, and
        crossing the bisector of a candidate of the first adds one to the first. Seventeen pieces lie in the ball of radius{' '}
        <i>T</i>, and only four pairs of counts occur among them.
      </P>

      <Definition n="4.8" plural>
        <p>
          The <Term>bisector arrangement</Term> of a motif point <i>a</i> is the set of the bisectors of <i>a</i> and each of
          its candidates.
        </p>
        <p>
          A <Term>face</Term> of a bisector arrangement is a piece of the plane that its bisectors cut out and none of them
          crosses.
        </p>
        <p>
          The <Term>label</Term> of a face is the list of numbers, one per occupancy class, of the candidates of that class
          nearer than <i>a</i> to the spots of the face.
        </p>
      </Definition>

      <P n="4.9">
        Every spot of a face inside the ball around <i>a</i> has the same chance that <i>a</i> is its <i>k</i>-th nearest kept
        site: the occupancy of <i>a</i> times the weight of <i>k</i> − 1 survivors in the table of weights built from the
        face’s label.
      </P>

      <P n="4.10" aside={<Static ids={['04-4']} />}>
        For <i>k</i> = 2 the central face stays white, because with no nearer site <i>a</i> can only be the first kept site.
        The darkest faces have one nearer site of each class, where <i>a</i> is second whenever the site of the first class is
        kept and the other missing, which is the likely outcome.
      </P>

      <P n="4.11">
        Adding the shaded areas, each times its shade, over the faces of <i>a</i> and of <i>b</i> gives{' '}
        <E>
          <Phi />
        </E>
        , the cumulative density averaged over the draws:
        <span className="display">
          <E>
            <Phi />
          </E>
          (<i>t</i>) = <Frac top="1" bottom={<U />} />{' '}
          <Gloss
            label={
              <>
                over <i>a</i> and <i>b</i>
              </>
            }
          >
            Σ<sub>a</sub>
          </Gloss>{' '}
          Σ
          <sub>
            faces <i>f</i> of <i>a</i>
          </sub>{' '}
          <Gloss label="a shaded face inside the ball">
            area(<i>f</i> ∩ <i>B</i>(<i>a</i>, <i>t</i>))
          </Gloss>{' '}
          ·{' '}
          <Gloss label="its shade">
            <i>p</i>
            <sub>a</sub> <i>w</i>
            <sub>
              label(<i>f</i>)
            </sub>
            (<i>k</i> − 1)
          </Gloss>
          <br />
          <E>
            <Psi />
          </E>
          (<i>t</i>) ={' '}
          <E>
            <Phi />
          </E>
          (<i>t</i>) −{' '}
          <E>
            <Phi k="k+1" />
          </E>
          (<i>t</i>)
        </span>
      </P>

      <Question
        n="4.12"
        ask={
          <>
            The bisector arrangement of <i>a</i> is built once, for the largest radius <i>T</i>, with every candidate within 2
            <i>T</i>. At a smaller radius <i>t</i>, fewer sites lie within 2<i>t</i> of <i>a</i>. Are the labels built for{' '}
            <i>T</i> still right at <i>t</i>?
          </>
        }
        answer={
          <>
            Yes: a label counts the sites nearer to the spot than <i>a</i>, which does not mention <i>t</i>, and the bisector
            of a candidate beyond 2<i>t</i> lies farther than <i>t</i> from <i>a</i>, outside the ball; only the face areas
            inside the ball change with <i>t</i>.
          </>
        }
      />
      <Static ids={['04-5-1', '04-5-2', '04-5-3']} />

      <P n="4.13">So a run builds one bisector arrangement per motif point, for the largest radius.</P>

      <Algorithm n="4.14" title="Expected density functions with occupancy classes">
        <ol>
          <li>
            Choose the largest radius <i>T</i>.
          </li>
          <li>
            For each motif point <i>a</i>, collect its candidates.
          </li>
          <li>
            Build the bisector arrangement of <i>a</i>, and write on each face its label.
          </li>
          <li>
            For each label, build the table of weights site by site, and multiply the weight of <i>k</i> − 1 survivors by the
            occupancy of <i>a</i>.
          </li>
          <li>
            At each radius <i>t</i> up to <i>T</i>, compute the area of each face inside the ball of radius <i>t</i> around{' '}
            <i>a</i>, cut into triangles and circular sectors.
          </li>
          <li>
            Sum the weighted areas over the faces and the motif points and divide by the area of the cell to get{' '}
            <E>
              <Phi />
            </E>
            , then take differences to get{' '}
            <E>
              <Psi />
            </E>
            .
          </li>
        </ol>
      </Algorithm>
      <Static ids={['04-6-1', '04-6-2', '04-6-3']} />

      <P n="4.15">
        The faces of <i>b</i> are those of <i>a</i> moved to <i>b</i> with the two counts of each label swapped, because the
        four sites nearest to <i>b</i> are of the first class.
      </P>
      <Static ids={['04-7-1', '04-7-2']} />

      <P n="4.16">
        A face that does not hold <i>a</i> is the fan of triangles and sectors from <i>a</i> to its far side, minus the grey
        fan to its near side.
      </P>

      <Question
        n="4.17"
        kind="try"
        ask={
          <>
            For the crystal with a square cell of side 1, the motif point (0, 0) at occupancy 0.9 in one occupancy class and
            the motif point (½, ¼) at occupancy 0.5 in another, compute{' '}
            <E>
              <Psi k={0} />
            </E>{' '}
            to{' '}
            <E>
              <Psi k={2} />
            </E>{' '}
            at radius 0.4 by hand from the labelled faces of both motif points, then in code for all radii up to 1, checking
            the code against the algorithm with one occupancy by giving both classes occupancy 0.3.
          </>
        }
        answer={
          <>
            At <i>t</i> = 0.4 each motif point has two candidates, the two nearest sites of the other class at distance √5/4,
            so its ball holds the face with label (0, 0) and two caps cut off by bisectors at distance <i>h</i> = √5/8. Each cap
            has area <i>A</i>
            <sub>1</sub> = <i>t</i>
            <sup>2</sup> arccos(<i>h</i>/<i>t</i>) − <i>h</i>√
            <span className="root">
              <i>t</i>
              <sup>2</sup> − <i>h</i>
              <sup>2</sup>
            </span>{' '}
            = 0.0476, and the central face has area <i>A</i>
            <sub>0</sub> = π<i>t</i>
            <sup>2</sup> − 2<i>A</i>
            <sub>1</sub> = 0.4075. The caps of (0, 0) have label (0, 1), with weights 0.5 and 0.5 for 0 and 1 kept; the caps
            of (½, ¼) have label (1, 0), with weights 0.1 and 0.9. With |<i>U</i>| = 1,
            <span className="display">
              <E>
                <Phi k={1} />
              </E>{' '}
              = 0.9 (<i>A</i>
              <sub>0</sub> + 2<i>A</i>
              <sub>1</sub> · 0.5) + 0.5 (<i>A</i>
              <sub>0</sub> + 2<i>A</i>
              <sub>1</sub> · 0.1) = 0.618,
              <br />
              <E>
                <Phi k={2} />
              </E>{' '}
              = 0.9 · 2<i>A</i>
              <sub>1</sub> · 0.5 + 0.5 · 2<i>A</i>
              <sub>1</sub> · 0.9 = 0.086,
            </span>
            so{' '}
            <E>
              <Psi k={0} />
            </E>{' '}
            = 0.382,{' '}
            <E>
              <Psi k={1} />
            </E>{' '}
            = 0.532 and{' '}
            <E>
              <Psi k={2} />
            </E>{' '}
            ={' '}
            <E>
              <Phi k={2} />
            </E>
            , since no spot lies within 0.4 of three sites. In code, with <i>T</i> = 1, each motif point has 26 candidates and
            117 faces. The curves meet the hand values on the dashed line at 0.4, and with both classes at 0.3 the code returns
            the curves of the algorithm with one occupancy at every radius:
            <Static ids={['04-8']} />
          </>
        }
      />

      <P n="4.18">
        The two labs compute the expected fingerprints of their files, the curves coincide, the fingerprint distance between
        them is zero, and every draw either lab samples lands near those curves.
      </P>
    </article>
  )
}
