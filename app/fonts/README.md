# Fonts

`big-shoulders-display-700.woff2` and `big-shoulders-display-800.woff2` are static instances of
Big Shoulders (Latin subset, as served by Google Fonts), cut with fontTools at `wght` 700 / 800 and
`opsz` 72, the only two styles the site uses. Copyright 2019 The Big Shoulders Project Authors
(https://github.com/xotypeco/big_shoulders), licensed under the SIL Open Font License 1.1
(https://openfontlicense.org). The font declares no Reserved Font Name.

To recut (e.g. after adding a weight): instantiate the variable font with
`fontTools.varLib.instancer.instantiateVariableFont(font, {"wght": W, "opsz": 72})` and save as woff2.
