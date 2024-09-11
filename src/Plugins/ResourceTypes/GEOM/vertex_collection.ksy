
meta:
  id: vertex_collection
  endian: le
params:
  - id: version
    type: u4

seq:
  - id: counts
    type: counts
  - id: formats 
    type: format
    repeat: expr
    repeat-expr: counts.formats
  - id: vertices
    type: vertex
    repeat: expr
    repeat-expr: counts.vertices

types:
  counts:
    seq:
      - id: vertices
        type: u4
      - id: formats 
        type: u4
  format:
    seq:
      - id: type
        type: u4
        valid:
          any-of: [1,2,3,4,5,6,7,10]
        doc: |
          1. Position
          2. Normal
          3. UV
          4. Bone Assignment
          5. Weights
          6. Tangent Normal
          7. Color
          10: VertexID
      - id: subtype 
        type: u4
        valid:
          min: 1
          max: 4
      - id: size
        type: u1
  vertex:
    seq:
      - id: elements
        type: i_element(_parent.formats[_index].type)
        repeat: expr
        repeat-expr: _parent.counts.formats
  i_element:
    params:
      - id: format
        type: u4
    seq:
      - id: content
        type:
          switch-on: format
          cases:
            1: position
            2: normal
            3: uv
            4: bone_assignment
            5: weights(_parent._parent.version)
            6: tangent_normal
            7: color
            10: id_element
  position:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4
      - id: z
        type: f4
  normal:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4
      - id: z
        type: f4
  uv:
    seq:
      - id: u
        type: f4
      - id: v
        type: f4
  bone_assignment:
    seq:
      - id: bone
        type: u4
  weights:
    params:
      - id: version
        type: u4
    seq:
      - id: high_precision
        type: f4
        repeat: expr
        repeat-expr: 4
        if: version == 0x00000005
      - id: low_precision
        type: u1
        repeat: expr
        repeat-expr: 4
        if: version == 0x0000000C
  tangent_normal:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4
      - id: z
        type: f4
  color:
    seq:
      - id: red
        type: u1
      - id: green
        type: u1
      - id: blue
        type: u1
      - id: alpha
        type: u1
  id_element:
    seq:
      - id: id
        type: u4
