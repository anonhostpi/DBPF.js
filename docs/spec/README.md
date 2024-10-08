---
pub_title: "Overview"
sidebar_position: 1
---

# The DBPF File Format Community Specification

The purpose of these documents is to provide an updated, comprehensive, and detailed description of the DBPF file format.
This is a community effort. The DBPF file format is a file format used in various games, including The Sims Series, SimCity, and Spore.

Currently, it is biased towards The Sims 4, for two reasons:
- Sims4Tools (s4pe, s4pi, etc) appear to provide the most compehensive and up-to-date parsers for the DBPF format.
- anonhostpi primarily develops tools for The Sims 4.

Additionally, without official feedback from EA or Maxis, a lot of this information is speculative and based on prior and ongoing reverse-engineering efforts.

Previous efforts to reverse-engineer the DBPF file format were heavily based out of the EA Maxis forums. However, EA has removed a lot (if not all) of this content.
To preserve this information and keep the community alive, this information is being compiled here on GitHub.
- see: [EA Maxis Forums Move](https://forums.ea.com/discussions/the-sims-franchise-discussion-en/nominations-thread---content-to-be-considered-for-migration/1339885?after=MjQuOHwyLjF8b3wxMHwxNDowLDM5OjF8MzA)
- _particularly, a lot of this information is just gone_: https://modthesims.info/wiki.php?title=Tutorials:TS4_General_Modding

## Table of Contents:
- [Pre: Background and Acknowledgements](#background-and-acknowledgements)
  - This section lists the various community projects and resources that this project is based on. Useful for further research and development of this library.
- [The DBPF File Format](DBPF.md)
  - [Introduction](DBPF.md#introduction)
  - [Versions](DBPF.md#versions)
    - [Known Versions](DBPF.md#known-versions)
  - [Structure](DBPF.md#structure)
    - [Header](DBPF.md#header)
    - [The Tables](DBPF.md#the-tables)
      - [Table Entries](DBPF.md#table-entries-aka-dbpf-resources)
        - [DBPF v1.0 - Table Version 7.0](DBPF.md#dbpf-v10---table-version-70)
        - [DBPF v1.1 - Table Version 7.1](DBPF.md#dbpf-v11---table-version-71)
        - [DBPF v2.0](DBPF.md#dbpf-v20)
        - [DBPF v3.0](DBPF.md#dbpf-v30)
  - [Resource Types](sections/ResourceTypes.md)
    - [THUM - Thumbnail](sections/ResourceTypes.md#thum---thumbnail)
      - Mime Types
    - [COBJ - Catalog Object](sections/ResourceTypes.md#cobj---catalog-object)
    - [GEOM - Body Geometry](sections/ResourceTypes.md#geom---body-geometry)
      - Structure
        - geom.ksy
        - vertex_collection.ksy
        - skin_controller.ksy
    - [BGEO - Blend Geometry](sections/ResourceTypes.md#bgeo---blend-geometry)
    
## Background and Acknowledgements

While the community spec is biased towards The Sims 4, it is compiled from various community resources across different games, including:
- Wikis:
  - [SimCity 4 Devotion (SimCity 4 Encyclopaedia)](https://wiki.sc4devotion.com/index.php?title=DBPF)
  - [ModTheSims Wiki](https://modthesims.info/wiki.php?title=DBPF)
  - [Niotso Wiki](http://wiki.niotso.org/DBPF)
  - [Sims Wiki](https://simswiki.info/wiki.php?title=DatabasePackedFile)
  - [Nraas Wiki](https://www.nraas.net/community/home)
  - [Sims4Group](https://github.com/Sims4Group/Sims4Group.github.io)

- Projects:
  - C#
    - Sims4Tools:
      - Github: [s4ptacle/Sims4Tools](https://github.com/s4ptacle/Sims4Tools)
    - Sims3Tools:
      - Github: [anonhostpi/Sims3ToolsClone](https://github.com/anonhostpi/Sims3ToolsClone)
      - SourceForge: [projects/sims3tools](https://sourceforge.net/projects/sims3tools/)
    - SimPE:
      - Github: [SimTactics/SimPE](https://github.com/SimTactics/SimPE)
      - SourceForge: [projects/simpe](https://sourceforge.net/projects/simpe/)
    - scDBPF:
      - Github: [noah-severyn/scdbpf](https://github.com/noah-severyn/csDBPF)
    - s3pi:
      - Github: [anonhostpi/s3piClone](https://github.com/anonhostpi/s3piClone)
      - SourceForge: [projects/s3pi](https://sourceforge.net/projects/s3pi/)
    - DBPF-package-manager:
      - Github: [owlks4](https://github.com/owlks4/DBPF-package-manager)
    - DBPFSharp:
      - Github: [0xC0000054/DBPFSharp](https://github.com/0xC0000054/DBPFSharp)
    - DBPF_Utils:
      - Github: [LeonPoon/DBPF_Utils](https://github.com/LeonPoon/DBPF_Utils)
    - OpenTS2:
      - Github: [LazyDuchess/OpenTS2](https://github.com/LazyDuchess/OpenTS2)
    - Gibbed.Sims4:
      - Github: [gibbed/Gibbed.Sims4](https://github.com/gibbed/Gibbed.Sims4)
    - Gibbed.Sims3:
      - Github: [gibbed/Gibbed.Sims3](https://github.com/gibbed/Gibbed.Sims3)
    - Gibbed.Spore:
      - Github: [gibbed/Gibbed.Spore](https://github.com/gibbed/Gibbed.Spore)
    - LlamaLogic:
      - Github: [Llama-Logic/LlamaLogic](https://github.com/Llama-Logic/LlamaLogic)
    - EchoWeaver/Sims3Game:
      - Github: [EchoWeaver/Sims3Game](https://github.com/Echoweaver/Sims3Game)

  - Python:
    - s4py:
      - Github: [thequux/s4py](https://github.com/thequux/s4py)
    - sims2py:
      - Github: [lingeringwillx/sims2py](https://github.com/lingeringwillx/sims2py)
    - dbpf:
      - Github: [fbstj/dbpf](https://github.com/fbstj/dbpf)
    - SimTools:
      - Github: [Dav1dde/simtools](https://github.com/Dav1dde/SimTools)
    - preview-HighHeels:
      - Github: [Oops19/preview-HighHeels](https://github.com/Oops19/preview-HighHeels)
  
  - Java:
    - jDBPFX:
      - Github: [memo33/jDBPFX](https://github.com/memo33/jDBPFX)
    - SporeModder-FX:
      - Github: [emd4600/SporeModder-FX](https://github.com/emd4600/SporeModder-FX)
    - SimReader:
      - Github: [Redned235/SimReader](https://github.com/Redned235/SimReader)
  
  - Rust:
    - dbpf:
      - Github: [chieltbest/dbpf](https://github.com/chieltbest/dbpf)
    - sims3-rs:
      - Github: [kitlith/sims3-rs](https://github.com/kitlith/sims3-rs)
  
  - TypeScript:
    - SporeTools:
      - Github: [Spore-Community/SporeTools](https://github.com/Spore-Community/SporeTools)
    - sims4toolkit:
      - Github: [sims4toolkit/models](https://github.com/sims4toolkit/models)
  
  - JavaScript:
    - sc4:
      - Github: [sebamarynissen/sc4](https://github.com/sebamarynissen/sc4)
  
  - C:
    - dbpf_reader:
      - Github: [ytaa/dbpf_reader](https://github.com/ytaa/dbpf_reader)
  
  - D:
    - dbpf-d:
      - Github: [chances/dbpf-d](https://github.com/chances/dbpf-d)
  
  - Tcl:
    - HexFiend-templates-sims
      - Github: [sw-uci/HexFiend-templates-Sims](https://github.com/sw-uci/HexFiend-templates-Sims)

  - Scala:
    - scdbpf:
      - Github: [memo33/scdbpf](https://github.com/memo33/scdbpf)
 
  - GoLang:
    - godbpf:
      - Github: [marcboudreau/godbpf](https://github.com/marcboudreau/godbpf)