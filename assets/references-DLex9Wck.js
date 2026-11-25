import{p as e,y as t}from"./index-Bl6xUSqL.js";var n=t(),r=`% Bibliography for the crystals project. 18 entries.
% Six from proposal/main.tex (v4): EHKSW21, SK22, WK26, WMPCK22, PFP22, mtcsp.
% Eight ported from the old proposal bibliography: EGGHSW24, AK22, Kur24,
% Smi21, Hei24, dBCvKO08, pymatgen, SIS26. Plus AK23, NS09, Hart19, Duque24.
% Fields below were checked against Crossref or the venue page on 2026-10-29.
% Anything not checked is a comment, not an invented field.

% Crossref lookup for this DOI returned 404 on 2026-10-29.
% Authors, title, LIPIcs 189, 32:1--32:16, and the DOI were checked on the
% Dagstuhl page https://drops.dagstuhl.de/entities/document/10.4230/LIPIcs.SoCG.2021.32
@inproceedings{EHKSW21,
  author    = {Edelsbrunner, Herbert and Heiss, Teresa and Kurlin, Vitaliy and Smith, Philip and Wintraecken, Mathijs},
  title     = {The Density Fingerprint of a Periodic Point Set},
  booktitle = {37th International Symposium on Computational Geometry (SoCG 2021)},
  series    = {Leibniz International Proceedings in Informatics (LIPIcs)},
  volume    = {189},
  pages     = {32:1--32:16},
  year      = {2021},
  doi       = {10.4230/LIPIcs.SoCG.2021.32},
}

% Crossref: chapter in Advances in Visual Computing / LNCS, pages 377-391, year 2022,
% ISBN 978-3-031-20712-9 (print) / 978-3-031-20713-6 (electronic).
% LNCS volume 13598 is ISVC 2022 Part I (not 13599). That volume number is from
% proposal/changes.md, 2026-10-22, not from the Crossref JSON, which omits it.
@inproceedings{SK22,
  author    = {Smith, Philip and Kurlin, Vitaliy},
  title     = {A Practical Algorithm for Degree-$k$ Voronoi Domains of Three-Dimensional Periodic Point Sets},
  booktitle = {Advances in Visual Computing (ISVC 2022)},
  series    = {Lecture Notes in Computer Science},
  volume    = {13598},
  pages     = {377--391},
  publisher = {Springer},
  year      = {2022},
  doi       = {10.1007/978-3-031-20713-6_29},
}

% Crossref: SIAM J. Appl. Math. volume 86, issue 3, pages 898-918.
% doi 10.1137/25m1736657. Issued 2026-05-08. Print issue dated 2026-06-30.
% arXiv:2108.04798 from old CLAUDE.md; API 2026-10-29: title match, v4, doi 10.1137/25M1736657.
@article{WK26,
  author        = {Widdowson, Daniel E. and Kurlin, Vitaliy A.},
  title         = {Pointwise Distance Distributions for Detecting Near-Duplicates in Large Materials Databases},
  journal       = {SIAM Journal on Applied Mathematics},
  volume        = {86},
  number        = {3},
  pages         = {898--918},
  year          = {2026},
  doi           = {10.1137/25M1736657},
  archivePrefix = {arXiv},
  eprint        = {2108.04798},
}

% Crossref: MATCH volume 87, issue 3, pages 529-559.
% published-print year 2022; published-online 2021-12. The v4 proposal cites 2022.
% arXiv:2009.02488 from old CLAUDE.md; API 2026-10-29: title is the preprint title
% "The asymptotic behaviour and a near linear time algorithm…"; author order on
% arXiv v4 is Widdowson, Mosca, Pulido, Kurlin, Cooper. Published Crossref order
% (used here) is Widdowson, Mosca, Pulido, Cooper, Kurlin.
@article{WMPCK22,
  author        = {Widdowson, Daniel and Mosca, Marco M. and Pulido, Angeles and Cooper, Andrew I. and Kurlin, Vitaliy},
  title         = {Average minimum distances of periodic point sets -- foundational invariants for mapping periodic crystals},
  journal       = {MATCH Communications in Mathematical and in Computer Chemistry},
  volume        = {87},
  number        = {3},
  pages         = {529--559},
  year          = {2022},
  doi           = {10.46793/match.87-3.529W},
  archivePrefix = {arXiv},
  eprint        = {2009.02488},
}

% Crossref: Nature Communications volume 13, article number 2991, 2022-05-30.
@article{PFP22,
  author  = {Takamoto, So and Shinagawa, Chikashi and Motoki, Daisuke and Nakago, Kosuke and Li, Wenwen and Kurata, Iori and Watanabe, Taku and Yayama, Yoshihiro and Iriguchi, Hiroki and Asano, Yusuke and Onodera, Tasuku and Ishii, Takafumi and Kudo, Takao and Ono, Hideki and Sawada, Ryohto and Ishitani, Ryuichiro and Ong, Marc and Yamaguchi, Taiki and Kataoka, Toshiki and Hayashi, Akihide and Charoenphakdee, Nontawat and Ibuka, Takeshi},
  title   = {Towards universal neural network potential for material discovery applicable to arbitrary combination of 45 elements},
  journal = {Nature Communications},
  volume  = {13},
  pages   = {2991},
  year    = {2022},
  doi     = {10.1038/s41467-022-30687-9},
}

% GitHub repository, checked 2026-10-29. Not a journal article.
@misc{mtcsp,
  author       = {{Matlantis}},
  title        = {Matlantis {CSP} (\\texttt{mtcsp}) docs},
  howpublished = {\\url{https://github.com/matlantis/matlantis-agent-skills}},
  year         = {2026},
  note         = {Accessed 22 Oct.\\ 2026},
}

% Added as required. Crossref: JMIV 65(5):689-701, 2023, doi 10.1007/s10851-023-01150-1.
% arXiv:2301.05137 checked on https://arxiv.org/abs/2301.05137 (title and authors match).
@article{AK23,
  author        = {Anosova, Olga and Kurlin, Vitaliy},
  title         = {Density Functions of Periodic Sequences of Continuous Events},
  journal       = {Journal of Mathematical Imaging and Vision},
  volume        = {65},
  number        = {5},
  pages         = {689--701},
  year          = {2023},
  doi           = {10.1007/s10851-023-01150-1},
  archivePrefix = {arXiv},
  eprint        = {2301.05137},
}

% --- Ported from master proposal/main.tex bibliography (checked 2026-10-29) ---

% Crossref 2026-10-29: SIAM J. Discrete Math. 38(2):1784-1807, published-print 2024-06-30.
% arXiv:2204.01077 from old CLAUDE.md; API: title match, journal_ref SIDMA 38.2 (2024).
@article{EGGHSW24,
  author        = {Edelsbrunner, Herbert and Garber, Alexey and Ghafari, Mohadese and Heiss, Teresa and Saghafian, Morteza and Wintraecken, Mathijs},
  title         = {Brillouin Zones of Integer Lattices and Their Perturbations},
  journal       = {SIAM Journal on Discrete Mathematics},
  volume        = {38},
  number        = {2},
  pages         = {1784--1807},
  year          = {2024},
  doi           = {10.1137/22M1489071},
  archivePrefix = {arXiv},
  eprint        = {2204.01077},
}

% Crossref 2026-10-29: chapter, pages 395-408, year 2022, ISBN 978-3-031-19896-0 / 978-3-031-19897-7.
% LNCS volume 13493 is from the 2026-10-22 bibliography check (proposal/changes.md), not
% from the Crossref JSON, which omits it. arXiv:2205.02226 from old CLAUDE.md; API title match.
@inproceedings{AK22,
  author        = {Anosova, Olga and Kurlin, Vitaliy},
  title         = {Density Functions of Periodic Sequences},
  booktitle     = {Discrete Geometry and Mathematical Morphology (DGMM 2022)},
  series        = {Lecture Notes in Computer Science},
  volume        = {13493},
  pages         = {395--408},
  publisher     = {Springer},
  year          = {2022},
  doi           = {10.1007/978-3-031-19897-7_31},
  archivePrefix = {arXiv},
  eprint        = {2205.02226},
}

% Crossref 2026-10-29: FoCM 24(3):805-863, published-print 2024-06, published-online 2022-12-07.
% arXiv:2201.05150 from old CLAUDE.md; API title match.
@article{Kur24,
  author        = {Kurlin, Vitaliy},
  title         = {Mathematics of 2-Dimensional Lattices},
  journal       = {Foundations of Computational Mathematics},
  volume        = {24},
  number        = {3},
  pages         = {805--863},
  year          = {2024},
  doi           = {10.1007/s10208-022-09601-8},
  archivePrefix = {arXiv},
  eprint        = {2201.05150},
}

% URL from master proposal/main.tex. HTTP 303 to https://livrepository.liverpool.ac.uk/3132154/
% on 2026-10-29; page title matches.
@phdthesis{Smi21,
  author = {Smith, Philip},
  title  = {Geometric and Topological Methods for Applications to Materials and Data Skeletonisation},
  school = {University of Liverpool},
  year   = {2021},
  url    = {https://livrepository.liverpool.ac.uk/id/eprint/3132154},
}

% URL from master proposal/main.tex. HTTP 200 on 2026-10-29.
% citation_title on the ISTA page: "New methods for applying topological data analysis to materials science".
% Title casing below is the master proposal bibitem.
@phdthesis{Hei24,
  author = {Heiss, Teresa},
  title  = {New Methods for Applying Topological Data Analysis to Materials Science},
  school = {ISTA},
  year   = {2024},
  url    = {https://research-explorer.ista.ac.at/record/18667},
}

% Crossref book 10.1007/978-3-540-77974-2 (2026-10-29): title "Computational Geometry",
% subtitle "Algorithms and Applications"; authors de Berg, Cheong, van Kreveld, Overmars;
% publisher Springer Berlin Heidelberg; year 2008; ISBN 978-3-540-77973-5 / 978-3-540-77974-2.
% "3rd ed." is from the master proposal bibitem; Crossref returned no edition-number field.
@book{dBCvKO08,
  author    = {de Berg, Mark and Cheong, Otfried and van Kreveld, Marc and Overmars, Mark},
  title     = {Computational Geometry: Algorithms and Applications},
  edition   = {3},
  publisher = {Springer},
  year      = {2008},
  doi       = {10.1007/978-3-540-77974-2},
  isbn      = {978-3-540-77973-5},
}

% Crossref 2026-10-29: Comput. Mater. Sci. 68:314-319, published-print 2013-02.
@article{pymatgen,
  author  = {Ong, Shyue Ping and Richards, William Davidson and Jain, Anubhav and Hautier, Geoffroy and Kocher, Michael and Cholia, Shreyas and Gunter, Dan and Chevrier, Vincent L. and Persson, Kristin A. and Ceder, Gerbrand},
  title   = {Python Materials Genomics (pymatgen): A robust, open-source python library for materials analysis},
  journal = {Computational Materials Science},
  volume  = {68},
  pages   = {314--319},
  year    = {2013},
  doi     = {10.1016/j.commatsci.2012.10.028},
}

% Crossref 2026-10-29: Phys. Rev. Materials volume 10, issue 6, article-number 063401,
% published-online 2026-06-02. "Nishimra" is the spelling in Crossref and arXiv:2503.21201
% (kept from the master proposal bibitem).
@article{SIS26,
  author  = {Shibayama, Takuya and Imamura, Hideaki and Nishimra, Katsuhiko and Shinohara, Kohei and Shinagawa, Chikashi and Takamoto, So and Li, Ju},
  title   = {Efficient crystal structure prediction using universal neural network potential with diversity preservation in genetic algorithms},
  journal = {Physical Review Materials},
  volume  = {10},
  number  = {6},
  eid     = {063401},
  year    = {2026},
  doi     = {10.1103/4knt-ccqg},
  note    = {Nishimra is the spelling in Crossref and arXiv:2503.21201},
}

% Crossref 2026-10-29: ACM Trans. Algorithms 5(4):1-48, published-print 2009-10,
% doi 10.1145/1597036.1597050. Cited in SK22 as [22] (directionB notes).
@article{NS09,
  author  = {Nguyen, Phong Q. and Stehl{\\'e}, Damien},
  title   = {Low-dimensional lattice basis reduction revisited},
  journal = {ACM Transactions on Algorithms},
  volume  = {5},
  number  = {4},
  pages   = {1--48},
  year    = {2009},
  doi     = {10.1145/1597036.1597050},
}

% Crossref 2026-10-29: J. Phys. Commun. 3(6):065009, published-print 2019-06-01,
% doi 10.1088/2399-6528/ab2937. Cited in SK22 Lemma 16 as [16, App. A.1].
% App. A.1 itself is not checked here (open item).
@article{Hart19,
  author  = {Hart, Gus L. W. and Jorgensen, Jeremy J. and Morgan, Wiley S. and Forcade, Rodney W.},
  title   = {A robust algorithm for k-point grid generation and symmetry reduction},
  journal = {Journal of Physics Communications},
  volume  = {3},
  number  = {6},
  pages   = {065009},
  year    = {2019},
  doi     = {10.1088/2399-6528/ab2937},
}

% arXiv API 2026-10-29: 2312.02827v2, updated 2024-05-16, author Frank Duque,
% title "Computing k-Crossing Visibility through k-levels". No journal_ref.
% Treat as a preprint (sota B7).
@misc{Duque24,
  author        = {Duque, Frank},
  title         = {Computing $k$-Crossing Visibility through $k$-levels},
  year          = {2024},
  archivePrefix = {arXiv},
  eprint        = {2312.02827},
  note          = {Preprint, v2 dated 16 May 2024. No journal version found.},
}
`,i=e();function a(e){let t=e.split(`
`).filter(e=>!/^\s*%/.test(e)).join(`
`),n=[],r=/@(\w+)\s*\{\s*([^,\s]+)\s*,/g,i;for(;i=r.exec(t);){let e={},a=r.lastIndex;for(;;){let n=/\s*(\w+)\s*=\s*/y;n.lastIndex=a;let r=n.exec(t);if(!r)break;a=n.lastIndex;let i=``;if(t[a]===`{`){let e=0,n=a;do t[a]===`{`?e++:t[a]===`}`&&e--,a++;while(e>0);i=t.slice(n+1,a-1)}else{let e=/[^,}\s]*/y;e.lastIndex=a,i=e.exec(t)[0],a=e.lastIndex}e[r[1].toLowerCase()]=i.replace(/\s+/g,` `).trim();let o=/\s*,/y;o.lastIndex=a,o.exec(t)&&(a=o.lastIndex)}n.push({key:i[2],type:i[1].toLowerCase(),fields:e}),r.lastIndex=a}return n}var o=e=>e.replace(/\{\\'(\w)\}|\\'\{?(\w)\}?/g,(e,t,n)=>`${t??n}́`.normalize(`NFC`)).replace(/\\(?:texttt|url|emph|textit)\{([^}]*)\}/g,`$1`).replace(/\\ /g,` `).replace(/---/g,`—`).replace(/--/g,`–`).replace(/[{}]/g,``),s=e=>o(e).split(/(\$[^$]+\$)/).map((e,t)=>e.startsWith(`$`)?(0,i.jsx)(`i`,{children:e.slice(1,-1)},t):(0,i.jsx)(n.Fragment,{children:e},t)),c=e=>e.split(` and `).map(e=>{let[t,n]=e.split(`,`).map(e=>e.trim());return n?`${n} ${t}`:t});function l(e){let t=c(e);return t.length===1?t[0]:`${t.slice(0,-1).join(`, `)} and ${t.at(-1)}`}var u=e=>`${e}${e%100>=11&&e%100<=13?`th`:[`th`,`st`,`nd`,`rd`][e%10]??`th`}`,d=e=>(e.fields.author??``).split(` and `)[0].split(`,`)[0].replace(/[{}]/g,``).replace(/^de /,``);function f({e}){let t=e.fields,n=t.volume?`${t.volume}${t.number?`(${t.number})`:``}`:``,r=t.pages??t.eid,a=[];e.type===`article`?a.push((0,i.jsx)(`i`,{children:s(t.journal)},`j`),n&&` ${n}`,r&&`:${o(r)}`,`, ${t.year}.`):e.type===`inproceedings`?a.push(`In `,(0,i.jsx)(`i`,{children:s(t.booktitle)},`b`),t.series&&`, ${t.series}`,n&&` ${n}`,r&&`, pages ${o(r)}`,t.publisher&&`. ${t.publisher}`,`, ${t.year}.`):e.type===`phdthesis`?a.push(`PhD thesis, ${t.school}, ${t.year}.`):e.type===`book`?a.push(t.edition&&`${u(Number(t.edition))} edition. `,`${t.publisher}, ${t.year}.`):a.push(t.year&&`${t.year}.`);let c=e.type===`book`?(0,i.jsx)(`i`,{children:s(t.title)}):s(t.title),d=t.url??(t.howpublished&&o(t.howpublished));return(0,i.jsxs)(`li`,{children:[(0,i.jsxs)(`span`,{className:`key`,children:[`[`,e.key,`]`]}),(0,i.jsxs)(`span`,{children:[o(l(t.author)),`. `,c,`. `,a,t.note&&(0,i.jsxs)(i.Fragment,{children:[` `,s(t.note.replace(/\.$/,``)),`.`]}),t.doi&&(0,i.jsxs)(i.Fragment,{children:[` `,(0,i.jsxs)(`a`,{href:`https://doi.org/${t.doi}`,children:[`doi:`,t.doi]}),`.`]}),t.eprint&&(0,i.jsxs)(i.Fragment,{children:[` `,(0,i.jsxs)(`a`,{href:`https://arxiv.org/abs/${t.eprint}`,children:[`arXiv:`,t.eprint]}),`.`]}),d&&(0,i.jsxs)(i.Fragment,{children:[` `,(0,i.jsx)(`a`,{href:d,children:d}),`.`]})]})]})}var p=a(r).sort((e,t)=>d(e).localeCompare(d(t))||e.fields.year.localeCompare(t.fields.year));function m(){return(0,i.jsxs)(`article`,{className:`course journal`,children:[(0,i.jsx)(`h1`,{children:`References`}),(0,i.jsx)(`ol`,{className:`refs`,children:p.map(e=>(0,i.jsx)(f,{e},e.key))})]})}export{m as References};