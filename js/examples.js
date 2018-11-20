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
  'let fir3 = λf.λx. \n' 
+ '  let s0 = {0} in\n'
+ '  let s1 = {0} in\n'
+ '  let s2 = {0} in\n'
+ '  let _ = link s0 to x in\n'
+ '  let _ = link s1 to s0 in\n'
+ '  let _ = link s2 to s1 in\n'
+ '  (f 0 s0) + (f 1 s1) + (f 2 s2)\n'
+ 'in\n'
+ '\n'
+ 'let input = {0} in\n'
+ 'let _ = link input to (deref input) + 1 in\n'
+ '\n'
+ 'let avg3 = fir3 (λy.λx. x / 3) (deref input) in\n' 
+ '\n'
+ 'let _ = step in\n' 
+ 'let _ = step in\n' 
+ 'let _ = step in\n' 
+ 'avg3'; 

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