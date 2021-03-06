
This document defines the specifications that this library depends on.

# CSS specifications

The CSS specifications implemented by browsers are endorsed by the World Wide Web Consortium (W3C) and authored by its CSS Working Group (CSSWG).

The W3C specifications are organized in [*classes*](https://www.w3.org/standards/types) (aka. *types*), in particular the classes of the *standard track*, identified by a [status code](https://www.w3.org/2021/Process-20211102/#maturity-levels) indicating their maturity:

  - First Public Working Draft (FPWD)
  - Working Draft (WD)
  - Candidate Recommendation (CR)
  - Proposed Recommendation (PR)
  - Recommendation (REC)

Some RECs may be continuously revised, like the HTML *living* standard, while others, like the CSS RECs, are maintained by creating a new version. Either the previous version becomes a Superseded REC, or the new version is an Amended REC, depending on the *classes of changes* the new version receives:

  - **editorial:** fixing broken links, invalid markup, non-normative contents, typos or grammatical errors, etc
  - **substantive:** new features or corrections that makes conforming implementations become non-conforming or vice-versa

A superseding REC includes editorial changes, while an Amended REC includes substantive changes. A CR can revert back to a WD if it needs to include substantive changes, while a PR can not.

CSS 1 is superseded by CSS 2. CSS 2.1 amends CSS 2 and incorporates its content with some parts that have been altered and others that have been removed. The removed parts may be used in other new specifications (aka. *modules*) labelled with *level 3*, while new features are defined in new specifications labelled with *level 1*.

The CSSWG defines [complementary classes](https://www.w3.org/blog/CSS/2007/11/01/css_recommendation_track/) (stages):

  - rewriting: WD
  - exploring: FPWD or WD
  - revising: WD
  - refining: WD
  - testing: CR or PR
  - stable: CR or PR
  - completed: REC

There may be a CR labelled with *level n* at the testing phase and a corresponding WD labelled with *level n+1* at a previous or the same stage. There may even be two CRs or WDs with different levels at the same stage.

Because this library relies on the data extracted by `@webref/css` from specifications, it relies on *a curated list of technical Web specifications that are deemed relevant for the Web platform* in their most up to date versions, which correspond to the files located in the [`ed` (editor drafts) folder of the `w3c/webref` repository](https://github.com/w3c/webref/tree/main/ed/css).

This folder may contain multiple levels of a specification: the level corresponding to the last *full* version and one or more (higher) levels, which corresponds to *delta* versions and only includes the differences with the full version.

The "level-less" URL of a specification most often references the last delta (but still relevant) version if any, otherwise the last full version, eg:

  - https://drafts.csswg.org/css-syntax/ provides the same content than https://drafts.csswg.org/css-syntax-3/
  - https://drafts.csswg.org/css-conditional/ provides a delta between level 5 and level 3 (full)
  - https://drafts.csswg.org/css-conditional-4/ provides a delta between level 4 and level 3 (full)

But `@webref/css` also references CSS Backgrounds and Borders Level 4, which is a delta version, and https://drafts.csswg.org/css-backgrounds/ refers to Level 3.

A "level-less" URL is handy for documenting a declaration in code because it does not need to be updated. But on the other hand, it refers to a dynamic content that could later no longer apply to the related code. Furthermore, the level is a hint for the currently supported version, therefore a JSDOC `@link` must use the URL that includes the highest level of the specification whose content is related to the code it applies to.

# Other specifications

- Compat
- ?
