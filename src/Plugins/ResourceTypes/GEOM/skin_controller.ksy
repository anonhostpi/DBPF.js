
meta:
  id: skin_controller
  endian: le
params:
  - id: version
    type: u4
seq:
  - id: index
    type: u4
    if: version == 0x00000005

  - id: uv_stitches
    type: uv_stitches
    if: version >= 0x0000000C
  - id: seam_stitches
    type: seam_stitches
    if: version >= 0x0000000D
  - id: slot_ray_intersections
    type: slot_ray_intersections(version)
    if: version >= 0x0000000C
types:
  uv_stitches:
    seq:
      - id: count
        type: u4
      - id: array
        type: uv_stitch
        repeat: expr
        repeat-expr: count
  uv_stitch:
    seq:
      - id: index # don't know what this does
        type: u4
      - id: count
        type: u4
      - id: array
        type: vector2
        repeat: expr
        repeat-expr: count
  seam_stitches:
    seq:
      - id: count
        type: u4
      - id: array
        type: seam_stitch
        repeat: expr
        repeat-expr: count
  seam_stitch:
    seq:
      - id: index
        type: u4
      - id: vertex_id
        type: u2
  
  slot_ray_intersections:
    params:
      - id: version
        type: u4
    seq:
      - id: count
        type: u4
      - id: array
        type: slot_ray_intersection(version)
        repeat: expr
        repeat-expr: count
  slot_ray_intersection:
    params:
      - id: version
        type: u4
    seq:
      - id: slot_index
        type: u4
      - id: indeces
        type: u2
        repeat: expr
        repeat-expr: 3
      - id: coords
        type: f4
        repeat: expr
        repeat-expr: 2
      - id: distance
        type: f4
      - id: offset_from_intersection_os
        type: vector3
      - id: slot_average_pos_os
        type: vector3
      - id: transform_to_ls
        type: vector4

      - id: pivot_bone_hash
        type: u4
        if: version >= 0x0000000E
      - id: pivot_bone_index
        size: 1
        if: version < 0x0000000E
  vector2:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4
  vector3:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4
      - id: z
        type: f4
  vector4:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4
      - id: z
        type: f4
      - id: w
        type: f4