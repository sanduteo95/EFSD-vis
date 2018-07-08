open Heterolist

module Ssac = struct 

  type 'a cell = ('a * 'a graph * 'a option) ref

  and 'a graph = Val of 'a 
               | Thunk of (unit -> 'a)
               | IF_Thunk of (unit -> 'a graph)
               | Cell of 'a cell 

  let lift t = Val t

  let rec peek g = 
    match g with
    | Val c -> c 
    | Thunk t -> t ()
    | IF_Thunk t -> peek (t ())
    | Cell x -> let (v,_,_) = !x in v 

  let apply t u =
    match (t, u) with
    | Val t , Val u -> Val (t u) 
    | _             -> Thunk (fun () -> (peek t) (peek u)) 

  let ifthenelse b t1 t2 =
    match b with
    | Val c -> if c then t1 else t2
    | _     -> IF_Thunk (fun () -> if peek b then t1 else t2) 

  let cells : Heterolist.t ref = ref (Heterolist.create()) 

  let create_cell g = 
    let v = peek g in
    let c = Cell (ref (v, g, None)) in
    print_string "create()\n"; 
    cells := Heterolist.add !cells c; 
    c 

  let init _ = 
    cells := Heterolist.create() 

  let step () = 
    print_string "step()\n"; 
    Heterolist.fold 
      (fun _ cell -> 
        match cell with 
        | Cell x -> 
          begin match !x with
                | (v, g, None) -> x := (v, g, Some (peek g))
                | _            -> failwith "should be None" 
          end
        | _ -> failwith "step: not a cell" 
      ) () !cells; 
    Heterolist.fold 
      (fun b cell -> 
        match cell with  
        | Cell x -> 
          begin match !x with
                | (v, g, Some w) -> x := (w, g, None); b || v != w
                | _              -> failwith "re-eval missing" 
          end
        | _ -> failwith "step: not a cell" 
      ) false !cells

  let rec link cell dep = 
    match cell with
    | Cell x -> let (v, _, _) = !x in print_string "link()\n"; x := (v, dep, None)
    | IF_Thunk t -> link (t()) dep
    | _ -> failwith "link: not a cell" 
  

  let (&~) = link 

end