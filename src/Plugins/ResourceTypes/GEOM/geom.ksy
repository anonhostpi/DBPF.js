
meta:
  id: geom
  file-extension: geom
  endian: le
  imports:
    - vertex_collection
    - skin_controller
seq:
  - id: header
    type: header
  - id: shader
    type: shader
  - id: merge_group
    type: u4
  - id: sort_order
    type: u4
  - id: verteces
    type: vertex_collection(header.version)
  - id: bodies
    type: bodies
  - id: skin_controller
    type: skin_controller(header.version)
  - id: bones
    type: bones
    doc: 32-bit hash of the bone name
  # insert TGI block list here
types:
  header:
    seq:
      - id: magic
        contents: 'GEOM'
      - id: version 
        type: u4
        valid:
          any-of: [0x00000005, 0x0000000C, 0x0000000D, 0x0000000E]
      - id: tgi
        type: tgi_header
  tgi_header:
    seq:
      - id: offset
        type: u4
        doc: Offset to the reference data from this object's offset -- may also be from this sequence entry's offset
      - id: size
        type: u4

  shader:
    seq:
      - id: id
        type: u4
        doc: "also referred to as 'EmbeddedID' in some tools. see [simswiki \\> Sims 3 \\> GEOM](https://simswiki.info/wiki.php?title=Sims_3:0x015A1849)"
      - id: size
        type: u4
        if: id != 0
      - id: mtnf
        type: mtnf 
        if: id != 0     
  mtnf:
    seq:
      - id: magic
        contents: 'MTNF' # or MTRL
      - id: unidentified
        type: u4
      - id: data_size
        type: u4
      - id: entries
        type: mtnf_array
      - id: data
        size: data_size
  mtnf_array:
    seq:
      - id: count
        type: u4
      - id: array
        type: mtnf_entry
        repeat: expr
        repeat-expr: count
  mtnf_entry:
    seq:
      - id: id
        type: u4
      - id: type
        type: u4
      - id: size
        type: u4
      - id: offset
        type: u4

  bodies:
    seq:
      - id: count
        type: u4
      - id: array
        type: body
        repeat: expr
        repeat-expr: count
  body:
    seq:
      - id: face_size
        type: u1
      - id: vertex_count
        type: u4
      - id: faces
        type: face(face_size)
        repeat: expr
        repeat-expr: vertex_count / 3
  face:
    params:
      - id: size
        type: u1
    seq: 
      - id: vertices
        size: size
        repeat: expr
        repeat-expr: 3

  bones:
    seq:
      - id: count
        type: u4
      - id: array
        type: u4
        repeat: expr
        repeat-expr: count