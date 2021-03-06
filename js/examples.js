var basic_ex = 
  '(λx.x + x + 1) 2'

var dfg_ex = 
  '(λx.λy.(x + x) + (y + y)) (deref ({0})) 2'

var link_ex = 
  'let c = {0} in\n'
+ 'let _ = (λx.λy.(x +x)+(y +y)) (deref c) 2 in\n'
+ 'link c to {1}'

var max_ex = 
  'let max = λx.λy.if x <= y then y else x in\n'
+ '\n'
+ 'let x = {1} in\n'
+ 'let y = {2} in\n'
+ 'let m = max (deref x) (deref y) in\n'
+ 'let _ = step in\n'
+ 'let _ = link x to 3 in\n'
+ 'let _ = step in\n'
+ 'm';

var alt_ex =
  'let state_machine = λinit. λtrans. λinp.\n'
+ '  let state = {init} in\n'
+ '  let _ = link state to (trans state inp) in\n'
+ '  state\n'
+ 'in\n'
+ '\n'
+ 'let alt = state_machine 1 (λs.λ_. 1 - (deref s)) 0 in\n'
+ 'let sum = λinp. state_machine 0 (λs.λi. i + (deref s)) inp in\n'
+ 'let alt_sum = sum (deref alt) in\n'
+ 'let _ = step in\n' 
+ 'let _ = step in\n' 
+ 'let _ = step in\n' 
+ 'peek alt_sum'; 

var fir_ex =
  'let pair = λx.λy.λz.z x y in\n'
+ 'let fst = λp.p (λx.λy.x) in\n'
+ 'let snd = λp.p (λx.λy.y) in\n'
+ '\n'
+ 'let nil = pair true true in \n'
+ 'let isnil = fst in \n'
+ 'let cons = λh.λt. pair false (pair h t) in\n'
+ 'let head = λz. fst (snd z) in\n'
+ 'let tail = λz. snd (snd z) in \n'
+ '\n'
+ 'let fir = rec g. λx. λl.\n'
+ '  if isnil l \n'
+ '  then \n'
+ '    pair x 0\n'
+ '  else \n'
+ '    let f = head l in \n'
+ '    let fs = tail l in \n'
+ '    let result = g x fs in \n'
+ '    let s = {0} in \n'
+ '    let _ = link s to deref (fst result) in \n'
+ '    pair s (f s + (snd result))\n'
+ 'in \n'
+ '\n'
+ 'let avg3 = λx. \n'
+ '   let w = λx. x / 3 in \n'
+ '   let l = cons w (cons w (cons w nil)) in\n'
+ '   snd (fir x l)\n'
+ 'in\n'
+ '\n'
+ 'let inp = {0} in \n'
+ 'avg3 inp\n'

var rsum_ex =
  'let signal =  \n' 
+ '  let s = {1} in\n'
+ '  let _ = link s to (deref s) + 1 in\n'
+ '  s\n'
+ 'in\n'
+ '\n'
+ 'let rsum = λi. \n' 
+ '  let s = {0} in\n'
+ '  let _ = link s to (deref s) + i in\n'
+ '  s\n'
+ 'in\n'
+ '\n'
+ 'let o = rsum signal in\n' 
+ 'let _ = step in\n' 
+ 'let _ = step in\n' 
+ 'let _ = step in\n' 
+ 'let _ = step in\n' 
+ 'let _ = step in\n' 
+ 'let _ = step in\n' 
+ 'o'; 