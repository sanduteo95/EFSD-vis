module Heterolist = struct 

	type t = int list

	let create _ = [] 

	let is_empty l = Obj.is_int (Obj.repr l)

	let add l v = 
		let ptr = Obj.new_block 0 2 in
		Obj.set_field ptr 0 (Obj.repr v);
		Obj.set_field ptr 1 (Obj.repr l);
		Obj.obj ptr

	let rec fold f b l = 
		let l_rep = Obj.repr l in
		let rec fold_aux b curr =
			match Obj.is_int curr with
			| true  -> b
			| false -> let x = Obj.obj (Obj.field curr 0) in
					   fold_aux (f b x) (Obj.field curr 1)
		in
		fold_aux b l_rep

	let nth l n =
		let rec nth_aux curr n =
			if n = 0 
			then
				Obj.obj (Obj.field curr 0)
			else
				nth_aux (Obj.field curr 1) (n - 1)
		in
		nth_aux (Obj.repr l) n

end