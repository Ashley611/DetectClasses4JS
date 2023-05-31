export let TextObjects = {};

TextObjects["di("] = {
    "di(": {
        in: ["(  (|  ) )"],
        key: "di(",
        out: ["(  (|) )"],
    },
    "d2i)": {
        in: ["( ( ) (|  ) ( ) )"],
        key: "d2i)",
        out: ["(|)"],
    },
    "di{": {
        in: ["{  {|  } }"],
        key: "di{",
        out: ["{  {|} }"],
    },
    "d2i}": {
        in: ["{ { } {|  } { } }"],
        key: "d2i}",
        out: ["{|}"],
    },
    "di<": {
        in: ["<  <|  > >"],
        key: "di<",
        out: ["<  <|> >"],
    },
    "d2i>": {
        in: ["< < > <|  > < > >"],
        key: "d2i>",
        out: ["<|>"],
    },
    "di[": {
        in: ["[  [|  ] ]"],
        key: "di[",
        out: ["[  [|] ]"],
    },
    "d2i]": {
        in: ["[ [ ] [|  ] [ ] ]"],
        key: "d2i]",
        out: ["[|]"],
    },
    "d3i[": {
        in: ["[ [ ] [|  ] [ ] ]"],
        key: "d3i]",
        out: ["[ [ ] [|  ] [ ] ]"],
    },
};

TextObjects["da("] = {
    "da(": {
        in: ["(  (|  ) )"],
        key: "da(",
        out: ["(  | )"],
    },
    "d2a)": {
        in: [" ( ( ) (|  ) ( ) ) "],
        key: "d2a)",
        out: [" | "],
    },
    "da{": {
        in: ["{  {|  } }"],
        key: "da{",
        out: ["{  | }"],
    },
    "d2a}": {
        in: [" { { } {|  } { } } "],
        key: "d2a}",
        out: [" | "],
    },
    "da<": {
        in: ["<  <|  > >"],
        key: "da<",
        out: ["<  | >"],
    },
    "d2a>": {
        in: [" < < > <|  > < > > "],
        key: "d2a>",
        out: [" | "],
    },
    "da[": {
        in: ["[  [|  ] ]"],
        key: "da[",
        out: ["[  | ]"],
    },
    "d2a]": {
        in: [" [ [ ] [|  ] [ ] ] "],
        key: "d2a]",
        out: [" | "],
    },
    "d3a[": {
        in: ["[ [ ] [|  ] [ ] ]"],
        key: "d3a]",
        out: ["[ [ ] [|  ] [ ] ]"],
    },
};

TextObjects["di'"] = {
    "di'": {
        in: ["'  '|  ' '"],
        key: "di'",
        out: ["'  '|' '"],
    },
    "di\"": {
        in: ["\"  \"|  \" \""],
        key: "di\"",
        out: ["\"  \"|\" \""],
    },
    "di`": {
        in: ["`  `|  ` `"],
        key: "di`",
        out: ["`  `|` `"],
    },
}

TextObjects["da'"] = {
    "da'": {
        in: ["'  '|  ' '"],
        key: "da'",
        out: ["'  |'"],
    },
    "da\"": {
        in: ["\"  \"|  \" \""],
        key: "da\"",
        out: ["\"  |\""],
    },
    "da`": {
        in: ["`  `|  ` `"],
        key: "da`",
        out: ["`  |`"],
    },
}