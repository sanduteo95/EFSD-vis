open Ssac

let (+++) = lift (+)

let signal =
	let s = [%SSAC cell 1] in 
	link s [%SSAC s +++ 1];
	s

let rsum i = 
	let s = [%SSAC cell 0] in 
	link s [%SSAC s +++ i];
	s


let _ = 
	init (); 
	let o = rsum signal in 
	step();
	step();
	step();
	step();
	step();
	step();
	step();
	step();
	print_int (peek o)