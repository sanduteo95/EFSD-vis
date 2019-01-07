# EFSD visualiser for the terminal
For the simplified UI version switch to branch [UI](https://github.com/sanduteo95/EFSD-vis/tree/UI).

This fork contains a stripped version of [EFSD-vis](https://github.com/anonymousgithubaccount/EFSD-vis) with the UI functionality removed and a few changes so that it can be run in Node.js and have the First Futamura Projection applied to it. Cannot be used as it is- it needs to be ran through a preprocessor implemented in a private repo. 

## Syntax
```
<var> ::= {variables}
<bool> ::= true | false
<num> ::= {num}
<const> ::= <bool> | <num>
<expr> ::= <var>
         | λ <var>. <expr>
         | <expr> <expr>
         | <const>
         | ~ <expr> 
         | <expr> + <expr> | <expr> - <expr> | <expr> * <expr> | <expr> / <expr> | <expr> <= <expr>
         | <expr> && <expr> | <expr> || <expr> 
         | rec <var>. <expr>
         | let <var> = <expr> in <expr>
         | { <expr> }
         | link <var> to <expr>
         | set <var> to <expr>
         | peek <expr>
         | deref <expr>
         | step
```
