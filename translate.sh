#!/bin/bash
ocamlfind ppx_tools/rewriter ./ssac_ext.native "$1" > "$2"