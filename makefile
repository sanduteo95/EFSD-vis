all:
	ocamlbuild -package compiler-libs.common ppx/ssac_ext.native

clean:
	rm -rf _build/
	rm ssac_ext.native