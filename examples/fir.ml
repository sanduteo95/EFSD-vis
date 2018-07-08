open Ssac


let get_in (a,b) = nth a 
let get_out (a,b) = nth b 

let (+++) = lift (+.)
let (///) = lift (/.)
let (---) = lift (-.)

let fir n f x =
  let rec construct_graph input sum k = 
    match k with
    | 0 -> sum
    | k -> let s = [%SSAC cell 0.0] in 
           link s input; 
           let i = lift (float_of_int (n - k)) in 
           construct_graph s [%SSAC (sum +++ (f i s))] (k - 1)
  in 
  let sum = construct_graph x (lift 0.0) n in
  ([x], [sum]) 

let _ = 
  init();
  let some_cell = [%SSAC cell 1.0] in 
  let fir3avg = fir 3 (lift (fun _ x -> x /. 3.0)) some_cell in
  step (); step (); step (); step ();
  peek (get_out fir3avg 0) 