---
pub_title: "Resource Types"
---

# DBPF Entry Resource Types
Each entry in a DBPF file has a type ID that determines what kind of resource it is.
There are quite a few of these, and not all are well known. This document will attempt
to list all known resource types and their meanings.

**NOTE:** This document follows a strict structure. Try not to deviate from it. It is used by scripts/resources.js to help generate plugin code.

## THUM - Thumbnail
| Value      | Type | Description | Source  |
|------------|------|-------------|---------|
| 0x3C1AF1F2 | png  | CAS Part Thumbnail                                    | [Sims4Tools \> ImageResources.txt#L30], [sims4toolkit \> binary-resources.ts#L12]
| 0x5B282D45 | png  | Body Part Thumbnail                                   | [Sims4Tools \> ImageResources.txt#L31], [LlamaLogic \> ResourceType.cs#L182]
| 0x9C925813 | png  | Sim Preset Thumbnail                                  | [Sims4Tools \> ImageResources.txt#L41], [LlamaLogic \> ResourceType.cs#L1218]
| 0xCD9DE247 | png  | Sim Featured Outfilt Thumbnail                        | [Sims4Tools \> ImageResources.txt#L44], [LlamaLogic \> ResourceType.cs#L1168]
| 0x0580A2B4 | png  | Catalog Object\* - 32x32                              | [Sims4Tools \> ImageResources.txt#L1], [Sims3Tools \> THUM.cs#L43], [simswiki \> Sims 3 \> Catalog Resource]
| 0x0580A2B5 | png  | Catalog Object\* - 128x128                            | [Sims4Tools \> ImageResources.txt#L2], [Sims3Tools \> THUM.cs#L43], [simswiki \> Sims 3 \> Catalog Resource]
| 0x0580A2B6 | png  | Catalog Object\* - 256x256                            | [Sims4Tools \> ImageResources.txt#L3], [Sims3Tools \> THUM.cs#L43], [simswiki \> Sims 3 \> Catalog Resource]
| 0x0589DC44 | png  | Catalog Wall/Floor Pattern - 32x32                    | [Sims4Tools \> ImageResources.txt#L7], [Sims3Tools \> THUM.cs#L55], [simswiki \> Sims 3 \> Catalog Resource]
| 0x0589DC45 | png  | Catalog Wall/Floor Pattern - 128x128                  | [Sims4Tools \> ImageResources.txt#L8], [Sims3Tools \> THUM.cs#L55], [simswiki \> Sims 3 \> Catalog Resource]
| 0x0589DC46 | png  | Catalog Wall/Floor Pattern - 256x256                  | [Sims4Tools \> ImageResources.txt#L9], [Sims3Tools \> THUM.cs#L55], [simswiki \> Sims 3 \> Catalog Resource]
| 0x0589DC47 | png  | Wallpaper Texture                                     | [Sims4Tools \> ImageResources.txt#L10], [modthesims \> Sims 3 \> comment by plasticbox]
| 0x05B17698 | png  | Catalog Fireplace - 32x32                             | [Sims4Tools \> ImageResources.txt#L11], [Sims3Tools \> THUM.cs#L51], [simswiki \> Sims 3 \> Catalog Resource]
| 0x05B17699 | png  | Catalog Fireplace - 128x128                           | [Sims4Tools \> ImageResources.txt#L12], [Sims3Tools \> THUM.cs#L51], [simswiki \> Sims 3 \> Catalog Resource]
| 0x05B1769A | png  | Catalog Fireplace - 256x256                           | [Sims4Tools \> ImageResources.txt#L13], [Sims3Tools \> THUM.cs#L51], [simswiki \> Sims 3 \> Catalog Resource]
| 0x05B1B524 | png  | Catalog Terrain Paint Brush - 32x32                   | [Sims4Tools \> ImageResources.txt#L14], [Sims3Tools \> THUM.cs#L50], [simswiki \> Sims 3 \> Catalog Resource]
| 0x05B1B525 | png  | Catalog Terrain Paint Brush - 128x128                 | [Sims4Tools \> ImageResources.txt#L15], [Sims3Tools \> THUM.cs#L50], [simswiki \> Sims 3 \> Catalog Resource]
| 0x05B1B526 | png  | Catalog Terrain Paint Brush - 256x256                 | [Sims4Tools \> ImageResources.txt#L16], [Sims3Tools \> THUM.cs#L50], [simswiki \> Sims 3 \> Catalog Resource]
| 0x2653E3C8 | png  | Catalog Fence - 32x32                                 | [Sims4Tools \> ImageResources.txt#L18], [Sims3Tools \> THUM.cs#L45], [simswiki \> Sims 3 \> Catalog Resource]
| 0x2653E3C9 | png  | Catalog Fence - 128x128                               | [Sims4Tools \> ImageResources.txt#L19], [Sims3Tools \> THUM.cs#L45], [simswiki \> Sims 3 \> Catalog Resource]
| 0x2653E3CA | png  | Catalog Fence - 256x256                               | [Sims4Tools \> ImageResources.txt#L20], [Sims3Tools \> THUM.cs#L45], [simswiki \> Sims 3 \> Catalog Resource]
| 0x2D4284F0 | png  | Catalog Railing - 32x32                               | [Sims4Tools \> ImageResources.txt#L21], [Sims3Tools \> THUM.cs#L49], [simswiki \> Sims 3 \> Catalog Resource]
| 0x2D4284F1 | png  | Catalog Railing - 128x128                             | [Sims4Tools \> ImageResources.txt#L22], [Sims3Tools \> THUM.cs#L49], [simswiki \> Sims 3 \> Catalog Resource]
| 0x2D4284F2 | png  | Catalog Railing - 256x256                             | [Sims4Tools \> ImageResources.txt#L23], [Sims3Tools \> THUM.cs#L49], [simswiki \> Sims 3 \> Catalog Resource]
| 0x5DE9DBA0 | png  | Catalog Stairs - 32x32                                | [Sims4Tools \> ImageResources.txt#L32], [Sims3Tools \> THUM.cs#L46], [simswiki \> Sims 3 \> Catalog Resource]
| 0x5DE9DBA1 | png  | Catalog Stairs - 128x128                              | [Sims4Tools \> ImageResources.txt#L33], [Sims3Tools \> THUM.cs#L46], [simswiki \> Sims 3 \> Catalog Resource]
| 0x5DE9DBA2 | png  | Catalog Stairs - 256x256                              | [Sims4Tools \> ImageResources.txt#L34], [Sims3Tools \> THUM.cs#L46], [simswiki \> Sims 3 \> Catalog Resource]
| 0x626F60CC | png  | Create-a-Sim Color Preset - 32x32                     | [Sims4Tools \> ImageResources.txt#L35], [Sims3Tools \> THUM.cs#L42], [pandemonium91]
| 0x626F60CD | png  | Create-a-Sim Color Preset - 128x128                   | [Sims4Tools \> ImageResources.txt#L35], [Sims3Tools \> THUM.cs#L42], [pandemonium91]
| 0x626F60CE | png  | Create-a-Sim Color Preset - 256x256                   | [Sims4Tools \> ImageResources.txt#L35], [Sims3Tools \> THUM.cs#L42], [pandemonium91]
| 0xFCEAB65B | png  | Custom Colourswatch                                   | [Sims4Tools \> ImageResources.txt#L48], [sims3-rs \> filetypes.rs#L115], [modthesims \> Sims 3 Wiki \> TestTable]
| 0xAD366F95 | png  | Ingredients/Seed                                      | [Sims4Tools \> ImageResources.txt#L42], [modthesims \> Sims 3 \> comment by plasticbox], [modthesims \> Sims 3 \> comment by tenmang]
| 0xAD366F96 | png  | Plate with a Sandwich                                 | [Sims4Tools \> ImageResources.txt#L43], [modthesims \> Sims 3 \> comment by plasticbox]
| 0x0D338A3A | jpg  | Lot Preview Thumbnail                                 | [Sims4Tools \> Extensions.txt#L97], [LlamaLogic \> ResourceType.cs#L687]
| 0x16CCF748 | jpg  | Sim Portrait Thumbnail                                | [Sims4Tools \> Extensions.txt#L99], [modthesims \> Sims 4 \> comment by plasticbox]
| 0x3C2A8647 | jpg  | Buy/Build Mode Thumbnail                              | [Sims4Tools \> Extensions.txt#L125], [LlamaLogic \> ResourceType.cs#L235]
| 0xA1FF2FC4 | jpg  | Worldmap Lot Thumbnail                                | [Sims4Tools \> Extensions.txt#L160], [LlamaLogic \> ResourceType.cs#L1810]
| 0xE18CAEE2 | jpg  | Sim Portrait Thumbnail                                | [Sims4Tools \> Extensions.txt#L191], [modthesims \> Sims 4 \> comment by plasticbox]
| 0xE254AE6E | jpg  | Sim Portrait Thumbnail                                | [Sims4Tools \> Extensions.txt#L193], [modthesims \> Sims 4 \> comment by plasticbox]
| 0x8E71065D | png  | Pet Breed Thumbnail                                   | [Sims4Tools (Development) \> Extensions.txt#L172], [LlamaLogic \> ResourceType.cs#L885]
| 0xB67673A2 | png  | Pet Face Preset Thumbnail                             | [Sims4Tools (Development) \> Extensions.txt#L210], [LlamaLogic \> ResourceType.cs#L901]
| 0xAB19BCBA | png  | Apartment Thumbnail 1                                 | [LlamaLogic \> ResourceType.cs#L87]
| 0xBD491726 | png  | Apartment Thumbnail 2                                 | [LlamaLogic \> ResourceType.cs#L93]
| 0x0119B36D | png  |                                                       | [LlamaLogic \> ResourceType.cs#L923]
| 0x2F7D0004 | png  | Moodlet Background Blends                             | [LlamaLogic \> ResourceType.cs#L929], [Sims4Group \> Packed File Types #L52], [EchoWeaver/Sims3Game \> MentorMedicine.cs#L89-90], [EchoWeaver/Sims3Game \> EWPetSuccombToWounds.cs#L31-48], [sims3-rs \> filetypes.rs#L97]
| 0x3BD45407 | png  | Sim Household Thumbnail                               | [Sims4Tools \> Extensions.txt#L123], [LlamaLogic \> ResourceType.cd#L1185]
| 0xD33C281E | png  | Blueprint Image                                       | [Sims4Tools (Development) \> Extensions.txt#L238], [LlamaLogic \> ResourceType.cs#L176]

\* Catalog Objects are also listed as:
- Catalog Proxy Product
- Catalog Terrain Geometry Bush
- Catalog Terrain Water Brush
- Catalog Fountain Tool
- Catalog Foundation
- Catalog Roof Style
- Catalog Roof Pattern
- Possibly also Wall/Floor Color

## COBJ - Catalog Object
- also tagged as `OBJD` (likely short for Object Data) in some tools like Nraas, Gibbed.Sims3, sims3-rs
  - [NRaas \> Extensions.txt#L106]
  - [Gibbed.Sims3 \> types.xml#L835-L841]
  - [sims3-rs \> filetypes.rs#L99]

| Value      | Type | Description | Source  |
|------------|------|-------------|---------|
| 0x319E4F1D | cobj | Catalog Object | [Sims4Tools \> Extensions.txt#L118]

[Sims4Tools \> ImageResources.txt#L1]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L1
[Sims4Tools \> ImageResources.txt#L2]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L2
[Sims4Tools \> ImageResources.txt#L3]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L3
[Sims4Tools \> ImageResources.txt#L7]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L7
[Sims4Tools \> ImageResources.txt#L8]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L8
[Sims4Tools \> ImageResources.txt#L9]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L9
[Sims4Tools \> ImageResources.txt#L10]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L10
[Sims4Tools \> ImageResources.txt#L11]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L11
[Sims4Tools \> ImageResources.txt#L12]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L12
[Sims4Tools \> ImageResources.txt#L13]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L13
[Sims4Tools \> ImageResources.txt#L14]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L14
[Sims4Tools \> ImageResources.txt#L15]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L15
[Sims4Tools \> ImageResources.txt#L16]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L16
[Sims4Tools \> ImageResources.txt#L18]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L18
[Sims4Tools \> ImageResources.txt#L19]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L19
[Sims4Tools \> ImageResources.txt#L20]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L20
[Sims4Tools \> ImageResources.txt#L21]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L21
[Sims4Tools \> ImageResources.txt#L22]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L22
[Sims4Tools \> ImageResources.txt#L23]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L23
[Sims4Tools \> ImageResources.txt#L30]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L30
[Sims4Tools \> ImageResources.txt#L32]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L32
[Sims4Tools \> ImageResources.txt#L33]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L33
[Sims4Tools \> ImageResources.txt#L34]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L34
[Sims4Tools \> ImageResources.txt#L35]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L35
[Sims4Tools \> ImageResources.txt#L36]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L36
[Sims4Tools \> ImageResources.txt#L37]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L37
[Sims4Tools \> ImageResources.txt#L31]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L31
[Sims4Tools \> ImageResources.txt#L41]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L41
[Sims4Tools \> ImageResources.txt#L42]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L42
[Sims4Tools \> ImageResources.txt#L43]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L43
[Sims4Tools \> ImageResources.txt#L44]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L44
[Sims4Tools \> ImageResources.txt#L48]:https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi%20Wrappers/ImageResource/ImageResources.txt#L48
[Sims4Tools \> Extensions.txt#L97]:https://github.com/gitter-badger/Sims4Tools/blob/65270049263de70b36f792abbba9ce2f7971de6d/s4pi%20Extras/Extensions/Extensions.txt#L97
[Sims4Tools \> Extensions.txt#L99]:https://github.com/gitter-badger/Sims4Tools/blob/65270049263de70b36f792abbba9ce2f7971de6d/s4pi%20Extras/Extensions/Extensions.txt#L99
[Sims4Tools \> Extensions.txt#L118]:https://github.com/gitter-badger/Sims4Tools/blob/65270049263de70b36f792abbba9ce2f7971de6d/s4pi%20Extras/Extensions/Extensions.txt#L118
[Sims4Tools \> Extensions.txt#L123]:https://github.com/gitter-badger/Sims4Tools/blob/65270049263de70b36f792abbba9ce2f7971de6d/s4pi%20Extras/Extensions/Extensions.txt#L123
[Sims4Tools \> Extensions.txt#L125]:https://github.com/gitter-badger/Sims4Tools/blob/65270049263de70b36f792abbba9ce2f7971de6d/s4pi%20Extras/Extensions/Extensions.txt#L125
[Sims4Tools \> Extensions.txt#L160]:https://github.com/gitter-badger/Sims4Tools/blob/65270049263de70b36f792abbba9ce2f7971de6d/s4pi%20Extras/Extensions/Extensions.txt#L160
[Sims4Tools \> Extensions.txt#L191]:https://github.com/gitter-badger/Sims4Tools/blob/65270049263de70b36f792abbba9ce2f7971de6d/s4pi%20Extras/Extensions/Extensions.txt#L191
[Sims4Tools \> Extensions.txt#L193]:https://github.com/gitter-badger/Sims4Tools/blob/65270049263de70b36f792abbba9ce2f7971de6d/s4pi%20Extras/Extensions/Extensions.txt#L193
[Sims4Tools (Development) \> Extensions.txt#L172]:https://github.com/s4ptacle/Sims4Tools/blob/b5db166dd4b935abc9f47c4c998fce98c61bd4de/s4pi%20Extras/Extensions/Extensions.txt#L172
[Sims4Tools (Development) \> Extensions.txt#L210]:https://github.com/s4ptacle/Sims4Tools/blob/b5db166dd4b935abc9f47c4c998fce98c61bd4de/s4pi%20Extras/Extensions/Extensions.txt#L210
[Sims4Tools (Development) \> Extensions.txt#L238]:https://github.com/s4ptacle/Sims4Tools/blob/b5db166dd4b935abc9f47c4c998fce98c61bd4de/s4pi%20Extras/Extensions/Extensions.txt#L238

[Sims3Tools \> THUM.cs#L42]:https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L42
[Sims3Tools \> THUM.cs#L43]:https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L43
[Sims3Tools \> THUM.cs#L45]:https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L45
[Sims3Tools \> THUM.cs#L46]:https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L46
[Sims3Tools \> THUM.cs#L49]:https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L49
[Sims3Tools \> THUM.cs#L50]:https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L50
[Sims3Tools \> THUM.cs#L51]:https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L51
[Sims3Tools \> THUM.cs#L55]:https://github.com/anonhostpi/Sims3ToolsClone/blob/fbe86c05d32ba2a7fcc027ff145ad29b2c50e026/s3oc/THUM.cs#L55

[sims4toolkit \> binary-resources.ts#L12]:https://github.com/sims4toolkit/models/blob/4345132fab79a92516095d22d9458b0db334dce5/src/lib/enums/binary-resources.ts#L12

[sims3-rs \> filetypes.rs#L97]:https://github.com/kitlith/sims3-rs/blob/c841e7ac71f7f9a01e7e828b2501b243371ff752/src/dbpf/filetypes.rs#L97
[sims3-rs \> filetypes.rs#L115]:https://github.com/kitlith/sims3-rs/blob/c841e7ac71f7f9a01e7e828b2501b243371ff752/src/dbpf/filetypes.rs#L115

[LlamaLogic \> ResourceType.cs#L87]:https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L87
[LlamaLogic \> ResourceType.cs#L93]:https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L93
[LlamaLogic \> ResourceType.cs#L176]:https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L176
[LlamaLogic \> ResourceType.cs#L182]:https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L182
[LlamaLogic \> ResourceType.cs#L235]:https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L235
[LlamaLogic \> ResourceType.cs#L687]:https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L687
[LlamaLogic \> ResourceType.cs#L885]:https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L885
[LlamaLogic \> ResourceType.cs#L901]:https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L901
[LlamaLogic \> ResourceType.cs#L923]:https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L923
[LlamaLogic \> ResourceType.cs#L929]:https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L929
[LlamaLogic \> ResourceType.cs#L1168]:https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L1168
[LlamaLogic \> ResourceType.cd#L1185]:https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L1185
[LlamaLogic \> ResourceType.cs#L1218]:https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L1218
[LlamaLogic \> ResourceType.cs#L1810]:https://github.com/Llama-Logic/LlamaLogic/blob/3aad55e7a7c76104ea0af5d22744e12c56e0ce46/LlamaLogic.Packages/ResourceType.cs#L1810

[modthesims \> Sims 3 \> comment by plasticbox]:https://modthesims.info/download.php?p=3078566#post3078566
[modthesims \> Sims 4 \> comment by plasticbox]:https://modthesims.info/showthread.php?p=4970712#post4970712
[modthesims \> Sims 3 \> comment by tenmang]:https://modthesims.info/showthread.php?p=4613964#post4613964
[modthesims \> Sims 3 Wiki \> TestTable]:https://modthesims.info/wiki.php?title=Sims_3:TestTable#:~:text=Thumbnail%20for%20packaged%20custom%20colourswatch

[simswiki \> Sims 3 \> Catalog Resource]:https://simswiki.info/wiki.php?title=Sims_3:Catalog_Resource#Thumbnail

[Sims4Group \> Packed File Types #L52]:https://github.com/Sims4Group/Sims4Group.github.io/blob/e993a6a5f917bea91763b8061b95725d6e224ab2/Sims-4---Packed-File-Types.mediawiki?plain=1#L52

[pandemonium91]:https://pandemonium91.wixsite.com/pandemonic-art/create-cas-presets-easily#5.%20Changing%20thumbnails%20and%20deleting%20extras:~:text=Once%20again%2C%20open%20your%20item%20in%20S3PE%20and%20look%20for%20the%20THUM%20resources.%20Normally%2C%20the%20game%20will%20generate%203%20sizes%20of%20thumbnails%3A%2032x32%20px%20(THUM%200x626F60CC)%2C%20128x128%20px%20(THUM%200x626F60CD)%20and%20256x256%20px%20(THUM%200x626F60CE)%20%E2%80%94%20we%20are%20only%20interested%20in%20the%20third%20type.

[EchoWeaver/Sims3Game \> MentorMedicine.cs#L89-90]:https://github.com/Echoweaver/Sims3Game/blob/ac087794c787d33c953688f13cf490b543b3ecd8/WarriorCats/Apprentice/MentorMedicine.cs#L89-L90
[EchoWeaver/Sims3Game \> EWPetSuccombToWounds.cs#L31-48]:https://github.com/Echoweaver/Sims3Game/blob/ac087794c787d33c953688f13cf490b543b3ecd8/Echoweaver.Sims3Game.PetFighting/EWPetSuccumbToWounds.cs#L31-L48

[NRaas \> Extensions.txt#L106]:https://github.com/Chain-Reaction/NRaas/blob/40dadea64faa18c2806534826bd8a913cf229668/NRaasPacker/Extensions.txt#L106
[Gibbed.Sims3 \> types.xml#L835-L841]:https://github.com/gibbed/Gibbed.Sims3/blob/060cffb249ed8497324d1f1b9783754b443e2571/bin/lists/types.xml#L835-L841
[sims3-rs \> filetypes.rs#L99]:https://github.com/kitlith/sims3-rs/blob/c841e7ac71f7f9a01e7e828b2501b243371ff752/src/dbpf/filetypes.rs#L99