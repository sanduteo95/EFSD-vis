open Ast_mapper
open Ast_helper
open Asttypes
open Parsetree
open Longident
open Set
open List

module VariableSet = Set.Make(String) 

let desugar binds t = 
  Exp.apply (Exp.fun_ Nolabel None ((List.hd binds).pvb_pat) t) [(Nolabel, ((List.hd binds).pvb_expr))]

let rec root_translater tag loc pstr = 
  match pstr with 
  | PStr [{ pstr_desc = 
            Pstr_eval (exp, _)}] -> ssac_translater exp (VariableSet.empty)
  | _ -> raise (Location.Error (Location.error ~loc:loc "Only expressions can be defined within the SSAC calculus. "))  


and ssac_translater exp vars = 
  match exp.pexp_desc with 
  | Pexp_ident id                       -> if VariableSet.mem (Longident.last id.txt) vars then Exp.construct {txt = Lident "Val"; loc = exp.pexp_loc} (Some exp) else exp
  | Pexp_constant c                     -> Exp.construct {txt = Lident "Val"; loc = exp.pexp_loc} (Some (Exp.constant c))
  | Pexp_apply (f, args)                -> apply_translater f args vars
  | Pexp_fun (_, _, pat, t)             -> let {ppat_desc = Ppat_var id} = pat in (* only single variable for now *)
                                           let vars = VariableSet.add id.txt vars in
                                           let g = ssac_translater t vars in 
                                           let body = Exp.apply (Exp.ident {txt = Lident "peek"; loc = t.pexp_loc}) [(Nolabel, g)] in
                                           Exp.construct {txt = Lident "Val"; loc = exp.pexp_loc} (Some (Exp.fun_ Nolabel None pat body))
  | Pexp_let (rec_flag, binds, t)       -> ssac_translater (desugar binds t) vars
                                           (*
                                           let g = ssac_translater t in 
                                           let new_binds = map (fun {pvb_pat = pat; pvb_expr = exp; pvb_attributes = att; pvb_loc = loc} -> 
                                                                    {pvb_pat = pat; pvb_expr = ssac_translater exp; pvb_attributes = att; pvb_loc = loc}) binds in 
                                           Exp.let_ rec_flag new_binds g
                                           *)
  | Pexp_ifthenelse (cond, t1, t2)      -> ifthenelse_translater (cond, t1, t2) vars
  | Pexp_sequence (t1, t2)              -> Exp.sequence (ssac_translater t1 vars) (ssac_translater t2 vars)
  | _ -> Exp.construct {txt = Lident "Val"; loc = exp.pexp_loc} (Some exp)
      (*raise (Location.Error (Location.error ~loc:(exp.pexp_loc) "This expression is not defined in the SSAC calculus. "))  *)


and apply_translater f args vars = 
  match f.pexp_desc with  
  | Pexp_ident {txt = Lident "cell"} | Pexp_ident {txt = Lident "Ssac.cell"} -> cell_translater f args vars
  | Pexp_ident {txt = Lident "link"} | Pexp_ident {txt = Lident "Ssac.link"} 
  | Pexp_ident {txt = Lident "&~"}   | Pexp_ident {txt = Lident "Ssac.&~"}   -> link_translater f args vars
  | Pexp_ident {txt = Lident "step"} | Pexp_ident {txt = Lident "Ssac.step"} -> step_translater f args
  | Pexp_ident {txt = Lident "peek"} | Pexp_ident {txt = Lident "Ssac.peek"} -> peek_translater f args vars
  | Pexp_ident {txt = Lident "init"} | Pexp_ident {txt = Lident "Ssac.init"} -> init_translater f args
  | _ -> let g = ssac_translater f vars in
         let rec fold_apply = function
            | [] -> raise (Location.Error (Location.error ~loc:(f.pexp_loc) "Function application cannot have no args. ")) 
            | [(l, u)] -> let k = ssac_translater u vars in
                          Exp.apply (Exp.ident {txt = Lident "apply"; loc = f.pexp_loc}) [(Nolabel, g); (l,k)]
            | (l, u) :: xs -> 
                          let k = ssac_translater u vars in
                          Exp.apply (Exp.ident {txt = Lident "apply"; loc = f.pexp_loc}) [(Nolabel, fold_apply xs); (l,k)]
         in
         fold_apply (rev_append args [])





and ifthenelse_translater (cond, t1, t2) vars =
  let g = ssac_translater cond vars in
  let h = ssac_translater t1 vars in 
  match t2 with
  | Some t2 -> let k = ssac_translater t2 vars in 
               Exp.apply (Exp.ident {txt = Lident "ifthenelse"; loc = cond.pexp_loc}) [(Nolabel, g); (Nolabel, h); (Nolabel, k)]
  | None    -> Exp.apply (Exp.ident {txt = Lident "ifthenelse"; loc = cond.pexp_loc}) [(Nolabel, g); (Nolabel, h)]








and cell_translater f args vars =
  match args with
  | [(l, u)] -> let h = ssac_translater u vars in 
                Exp.apply (Exp.ident {txt = Lident "create_cell"; loc = f.pexp_loc})
                  [(l, h)]
  | _ -> raise (Location.Error (Location.error ~loc:(f.pexp_loc) "The cell operation only accepts 1 argument. "))  

and link_translater f args vars = 
  match args with
  | [(l_t, t); (l_u, u)] -> let g = ssac_translater t vars in 
                            let h = ssac_translater u vars in
                            Exp.construct {txt = Lident "Val"; loc = f.pexp_loc} 
                              (Some (Exp.apply (Exp.ident {txt = Lident "link"; loc = f.pexp_loc}) 
                                      [(l_t, g);(l_u, h)])) 
  | _ -> raise (Location.Error (Location.error ~loc:(f.pexp_loc) "The link operation only accepts 2 arguments. ")) 

and step_translater f args = 
  match args with
  | [(l, {pexp_desc = 
            Pexp_construct 
              ({txt = Lident "()"; loc = loc}, None)})] -> Exp.construct {txt = Lident "Val"; loc = f.pexp_loc} 
                                                              (Some (Exp.apply (Exp.ident {txt = Lident "step"; loc = f.pexp_loc}) 
                                                                  [(l, Exp.construct {txt = Lident "()"; loc = loc} None)]))
  | _ -> raise (Location.Error (Location.error ~loc:(f.pexp_loc) "The step operation only accepts an unit argument. ")) 

and peek_translater f args vars = 
  match args with
  | [(l, u)] -> Exp.construct {txt = Lident "Val"; loc = f.pexp_loc} 
                    (Some (Exp.apply (Exp.ident {txt = Lident "peek"; loc = f.pexp_loc}) 
                        [(l, ssac_translater u vars)]))
  | _ -> raise (Location.Error (Location.error ~loc:(f.pexp_loc) "The peek operation only accepts an unit argument. ")) 

and init_translater f args = 
  match args with
  | [(l, {pexp_desc = 
            Pexp_construct 
              ({txt = Lident "()"; loc = loc}, None)})] -> Exp.construct {txt = Lident "Val"; loc = f.pexp_loc} 
                                                              (Some (Exp.apply (Exp.ident {txt = Lident "init"; loc = f.pexp_loc}) 
                                                                  [(l, Exp.construct {txt = Lident "()"; loc = loc} None)]))
  | _ -> raise (Location.Error (Location.error ~loc:(f.pexp_loc) "The init operation only accepts an unit argument. "))


