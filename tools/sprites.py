PALETTE = {
    "K": "#4a4030",  # outline (warm dark brown, visible on white pages)
    "W": "#fbf7e8",  # cream body
    "w": "#e8dfbf",  # body shade / wing
    "Y": "#fbe36a",  # yellow head
    "y": "#f0cf3a",  # crest
    "O": "#f5893a",  # orange cheek
    "E": "#b3202a",  # red lutino eye
    "P": "#f2b5a5",  # pink beak / feet
    "G": "#efe2a0",  # tail feathers
}

# All sprites 16x16, facing RIGHT (beak on the right).
SPRITES = {
    "perch": [
        "........KK......",
        "........KyK.....",
        ".........KyK....",
        "......KKKYyK....",
        ".....KYYYYYYK...",
        ".....KYYYYEYYK..",
        ".....KYYYOOYPPK.",
        ".....KWYYOOYKPK.",
        ".....KWWYYYKK...",
        "....KWWWWWWK....",
        "....KWWwWWWK....",
        "...KWWwwWWWK....",
        "...KWwwwWWK.....",
        "..KGwKPKKPK.....",
        ".KGGK.P..P......",
        "KGK.............",
    ],
    "fly1": [
        "................",
        "......KK........",
        ".....KWwK.......",
        ".....KWWwK...KK.",
        "......KWWwK.KyK.",
        "......KWWWKKYYYK",
        ".......KWWKYYEYK",
        "....KKKKWWWYOOPK",
        "..KKWWWWWWWWYKPK",
        "KKGGWWWWWWWWKK..",
        "KGGWWKKKWWWK....",
        ".KGGK...KKK.....",
        "..KK............",
        "................",
        "................",
        "................",
    ],
    "fly2": [
        "................",
        "................",
        "................",
        ".............KK.",
        "............KyK.",
        "...........KYYYK",
        "..........KYYEYK",
        "....KKKKKKWYOOPK",
        "..KKWWWWWWWWYKPK",
        "KKGGWWWwwWWWKK..",
        "KGGWWKWWwwKK....",
        ".KGGK.KWwwwK....",
        "..KK...KWwwK....",
        ".......KWwK.....",
        "........KK......",
        "................",
    ],
}


def variant(base, overrides):
    rows = [list(r) for r in SPRITES[base]]
    for (x, y), c in overrides.items():
        rows[y][x] = c
    return ["".join(r) for r in rows]


def shift_head(base, dx, dy, rows_n=7):
    """Move the top `rows_n` rows (the head) by dx,dy."""
    src = SPRITES[base]
    out = [list(r) for r in src]
    for y in range(rows_n):
        out[y] = ["."] * 16
    for y in range(rows_n):
        for x in range(16):
            c = src[y][x]
            if c == ".":
                continue
            nx, ny = x + dx, y + dy
            if 0 <= nx < 16 and 0 <= ny < 16:
                out[ny][nx] = c
    # fill neck gap with red if head moved up
    return ["".join(r) for r in out]


SPRITES["blink"] = variant("perch", {(10, 5): "K"})
SPRITES["talk"] = variant("perch", {(13, 7): "K", (12, 8): "K", (13, 8): "P", (14, 8): "K", (13, 9): "K"})
SPRITES["bob"] = shift_head("perch", 1, 1, rows_n=8)
SPRITES["sleep"] = shift_head("blink", -1, 1, rows_n=8)
SPRITES["alert"] = variant("perch", {(8, 0): ".", (9, 0): ".", (8, 1): ".", (9, 1): "K", (10, 1): ".", (9, 2): "K", (10, 2): "y", (11, 2): "K", (10, 0): "K", (10, 1): "y", (11, 1): "K", (11, 0): "."})
