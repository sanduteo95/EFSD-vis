define(['ast/abstraction', 'ast/application', 'ast/identifier', 'ast/constant',
	'ast/operation', 'ast/unary-op', 'ast/binary-op', 'ast/if-then-else', 'ast/recursion',
	'ast/provisional-constant', 'ast/change', 'ast/assign', 'ast/propagation', 
	'ast/deprecation', 'ast/deref', 'parser/lexer', 'parser/parser', 'token', 'link',
	'graph', 'group', 'term', 'box-wrapper', 'nodes/expo', 'nodes/abs', 'nodes/app',
	'nodes/binop', 'nodes/const', 'nodes/contract', 'nodes/der', 'nodes/var', 
	'nodes/if', 'nodes/pax', 'nodes/promo', 'nodes/recur', 'nodes/start', 'nodes/unop',
	'nodes/weak', 'nodes/delta', 'nodes/set', 'nodes/dep', 'nodes/deref', 'nodes/mod',
	'nodes/prop', 'nodes/prov', 'helper'
], 
	function(Abstraction, Application, Identifier, Constant, 
		Operation, UnaryOp, BinaryOp, IfThenElse, Recursion,
		ProvisionalConstant, Change, Assign, Propagation,
		Deprecation, Dereference, Lexer, Parser, MachineToken, Link,
		Graph, Group, Term, BoxWrapper, Expo, Abs, App,
		BinOp, Const, Contract, Der, Var, 
		If, Pax, Promo, Recur, Start, UnOp,
		Weak, Delta, Set, Dep, Deref, Mod, Prop, Prov, Helper) {
			
	class GoIMachine {
		
		constructor() {
			this.graph = new Graph(this);
			Helper.graph = this.graph; // cheating!
			this.token = new MachineToken(this); 
			this.count = 0;

			this.token.isMain = true;
			this.evalTokens = [];
			this.cells = [];
			this.evaluating = false;
			this.newValues = new Map();
			this.hasUpdate = false;

			this.play = false;
			this.playing = false;
			this.finished = false;
		}

		isPlay () {
			return this.playing;
		}

		setPlay (playValue) {
			this.play = playValue;
		}

		isPlaying () {
			return this.playing;
		}

		setPlaying (playingValue) {
			this.playing = playingValue;
		}

		isFinished () {
			return this.finished;
		}

		setFinished (finishedValue) {
			this.finished = finishedValue;
		}

		compile(source) {
			const lexer = new Lexer(source + '\0');
			const parser = new Parser(lexer);
			const ast = parser.parse();
			// init
			this.graph.clear();
			this.token.reset();
			this.count = 0;

			this.evalTokens = [];
			this.cells = [];
			this.readyEvalTokens = 0;
			this.evaluating = false;
			this.newValues.clear();
			this.hasUpdate = false;
			// create graph
			var start = new Start().addToGroup(this.graph.child);
			var term = this.toGraph(ast, this.graph.child);
			new Link(start.key, term.prin.key, "n", "s").addToGroup(this.graph.child);
			this.deleteVarNode(this.graph.child);
		}

		// translation
		toGraph(ast, group) {
			var graph = this.graph;

			if (ast instanceof Identifier) {
				var v = new Var(ast.name).addToGroup(group);
				return new Term(v, [v]);
			} 

			else if (ast instanceof Abstraction) {
				var param = ast.param;
				var wrapper = BoxWrapper.create().addToGroup(group);
				var abs = new Abs().addToGroup(wrapper.box);
				var term = this.toGraph(ast.body, wrapper.box);
				new Link(wrapper.prin.key, abs.key, "n", "s").addToGroup(wrapper);

				new Link(abs.key, term.prin.key, "e", "s").addToGroup(abs.group);

				var auxs = Array.from(term.auxs);
				var paramUsed = false;
				var auxNode;
				for (let aux of term.auxs) {
					if (aux.name == param) {
						paramUsed = true;
						auxNode = aux;
						break;
					}
				}
				if (paramUsed) {
					auxs.splice(auxs.indexOf(auxNode), 1);
				} else {
					auxNode = new Weak(param).addToGroup(abs.group);
				}
				new Link(auxNode.key, abs.key, "nw", "w", true).addToGroup(abs.group);

				wrapper.auxs = wrapper.createPaxsOnTopOf(auxs);

				return new Term(wrapper.prin, wrapper.auxs);
			} 

			else if (ast instanceof Application) {
				var app = new App().addToGroup(group);
				//lhs
				var left = this.toGraph(ast.lhs, group);
				var der = new Der(left.prin.name).addToGroup(group);
				new Link(der.key, left.prin.key, "n", "s").addToGroup(group);
				// rhs
				var right = this.toGraph(ast.rhs, group);		
				
				new Link(app.key, der.key, "w", "s").addToGroup(group);
				new Link(app.key, right.prin.key, "e", "s").addToGroup(group);

				return new Term(app, Term.joinAuxs(left.auxs, right.auxs, group));
			} 

			else if (ast instanceof Constant) {
				var wrapper = BoxWrapper.create().addToGroup(group);
				var constant = new Const(ast.value).addToGroup(wrapper.box);
				new Link(wrapper.prin.key, constant.key, "n", "s").addToGroup(wrapper);
				return new Term(wrapper.prin, wrapper.auxs);
			}

			else if (ast instanceof BinaryOp) {
				var binop = new BinOp(ast.name).addToGroup(group);

				binop.subType = ast.type;
				var left = this.toGraph(ast.v1, group);
				var right = this.toGraph(ast.v2, group);

				new Link(binop.key, left.prin.key, "w", "s").addToGroup(group);
				new Link(binop.key, right.prin.key, "e", "s").addToGroup(group);

				return new Term(binop, Term.joinAuxs(left.auxs, right.auxs, group));
			}

			else if (ast instanceof UnaryOp) {
				var unop = new UnOp(ast.name).addToGroup(group);
				unop.subType = ast.type;
				var box = this.toGraph(ast.v1, group);

				new Link(unop.key, box.prin.key, "n", "s").addToGroup(group);

				return new Term(unop, box.auxs);
			}

			else if (ast instanceof IfThenElse) {
				var ifnode = new If().addToGroup(group);
				var cond = this.toGraph(ast.cond, group);
				var t1 = this.toGraph(ast.t1, group);
				var t2 = this.toGraph(ast.t2, group);

				new Link(ifnode.key, cond.prin.key, "w", "s").addToGroup(group);
				new Link(ifnode.key, t1.prin.key, "n", "s").addToGroup(group);
				new Link(ifnode.key, t2.prin.key, "e", "s").addToGroup(group);

				return new Term(ifnode, Term.joinAuxs(Term.joinAuxs(t1.auxs, t2.auxs, group), cond.auxs, group));
			}

			else if (ast instanceof Recursion) {
				var p1 = ast.param;
				// recur term
				var wrapper = BoxWrapper.create().addToGroup(group);
				wrapper.prin.delete();
				var recur = new Recur().addToGroup(wrapper);
				wrapper.prin = recur;
				var box = this.toGraph(ast.body, wrapper.box);
				wrapper.auxs = wrapper.createPaxsOnTopOf(box.auxs);

				new Link(recur.key, box.prin.key, "e", "s").addToGroup(wrapper);

				var p1Used = false;
				var auxNode1;
				for (var i=0; i<wrapper.auxs.length; i++) {
					var aux = wrapper.auxs[i];
					if (aux.name == p1) {
						p1Used = true;
						auxNode1 = this.graph.findNodeByKey(aux.findLinksInto(null)[0].from);
						aux.delete();
						break;
					}
				}
				if (p1Used) {
					// wrapper.auxs.splice(wrapper.auxs.indexOf(auxNode1), 1);
				} else {
					auxNode1 = new Weak(p1).addToGroup(wrapper.box);
				}
				new Link(auxNode1.key, recur.key, "nw", "w", true).addToGroup(wrapper);
				return new Term(wrapper.prin, wrapper.auxs);
			}

			else if (ast instanceof ProvisionalConstant) {
				var term = this.toGraph(ast.term, group);
				var prov = new Prov().addToGroup(group);
				new Link(prov.key, term.prin.key, "n", "s").addToGroup(group);
				return new Term(prov, term.auxs);
			}

			else if (ast instanceof Deprecation) {
				var term = this.toGraph(ast.term, group);
				var dep = new Dep().addToGroup(group);
				new Link(dep.key, term.prin.key, "n", "s").addToGroup(group);
				return new Term(dep, term.auxs);
			}

			else if (ast instanceof Dereference) {
				var term = this.toGraph(ast.term, group);
				var deref = new Deref().addToGroup(group);
				new Link(deref.key, term.prin.key, "n", "s").addToGroup(group);
				return new Term(deref, term.auxs); 
			}

			else if (ast instanceof Change) {
				var param = ast.param;
				var delta = new Delta().addToGroup(group);
				var term = this.toGraph(ast.body, group);
				var v = new Var(param).addToGroup(group);
				new Link(delta.key, v.key, "w", "s").addToGroup(group);
				new Link(delta.key, term.prin.key, "e", "s").addToGroup(group);

				var auxs = Array.from(term.auxs);
				var p1Used = false;
				var auxNode1;
				for (var i=0; i<term.auxs.length; i++) {
					var aux = auxs[i];
					if (aux.name == param) {
						p1Used = true;
						auxs.splice(i, 1);
						var con = new Contract(aux.name).addToGroup(group);
						new Link(aux.key, con.key, "n", "s").addToGroup(group);
						new Link(v.key, con.key, "n", "s").addToGroup(group);
						auxs.push(con);
						break;
					}
				}
				if (!p1Used)
					auxs.push(v);

				return new Term(delta, auxs);
			}

			else if (ast instanceof Assign) {
				var param = ast.param;
				var setn = new Set().addToGroup(group);
				var term = this.toGraph(ast.body, group);
				var v = new Var(param).addToGroup(group);
				new Link(setn.key, v.key, "w", "s").addToGroup(group);
				new Link(setn.key, term.prin.key, "e", "s").addToGroup(group);

				var auxs = Array.from(term.auxs);
				var p1Used = false;
				var auxNode1;
				for (var i=0; i<term.auxs.length; i++) {
					var aux = auxs[i];
					if (aux.name == param) {
						p1Used = true;
						auxs.splice(i, 1);
						var con = new Contract(aux.name).addToGroup(group);
						new Link(aux.key, con.key, "n", "s").addToGroup(group);
						new Link(v.key, con.key, "n", "s").addToGroup(group);
						auxs.push(con);
						break;
					}
				}
				if (!p1Used)
					auxs.push(v);

				return new Term(setn, auxs);
			}

			else if (ast instanceof Propagation) {
				var prop = new Prop().addToGroup(group);
				return new Term(prop, []);
			}
		}

		deleteVarNode(group) {
			for (let node of Array.from(group.nodes)) {
				if (node instanceof Group)
					this.deleteVarNode(node);
				else if (node instanceof Var) 
					node.deleteAndPreserveOutLink();
			}
		}

		startPropagation() {
			this.evaluating = true;
			this.hasUpdate = false;
			for (let key of this.cells) {
				var cell = this.graph.findNodeByKey(key);
				var evalToken = new MachineToken(this);
				evalToken.isMain = false;
				evalToken.setLink(cell.findLinksOutOf('e')[0]);
				this.evalTokens.push(evalToken);
			} 
		}

		shuffle(a) {
		    var j, x, i;
		    for (i = a.length - 1; i > 0; i--) {
		        j = Math.floor(Math.random() * (i + 1));
		        x = a[i];
		        a[i] = a[j];
		        a[j] = x;
		    }
		}

		batchPass(tokens) {
			// random	
			/*	
			var arr = Array.from(new Array(tokens.length),(val,index)=>index+1);	
			this.shuffle(arr);	
			for (var i=0; i<arr.length; i++) {	
				var token = arr_2[arr[i]-1];	
				this.tokenPass(token, flag, dataStack, boxStack, modStack);	
			}	
			*/
			var arr_2 = Array.from(tokens);
			// all progress 1 step
			for (var i=0; i<arr_2.length; i++) {
				var token = arr_2[i];
				
				this.tokenPass(token);
			}
		}

		// machine step
		pass() {
			if (!this.isFinished()) {
				/*	
				this.count++;	
				if (this.count == 200) {	
					this.count = 0;	
					this.gc.collect();	
				}	
				*/
				if (this.evaluating) {
					this.batchPass(this.evalTokens);
					if (this.evalTokens.length == 0) {
						this.evaluating = false;
						var machine = this;
						this.newValues.forEach(function(value, key, map) {
							var mod = machine.graph.findNodeByKey(key);
							var oldData = mod.update(value);
							if (oldData != value)
								machine.hasUpdate = true;
						})
						this.newValues.clear();
						return;
					}
				}

				else
					this.tokenPass(this.token);
			}

			return this.getData(this.token);
		}

		tokenPass(token) {
			var node;
			if (!token.transited) {
				if (token.link != null) {
					var target = token.forward ? token.link.to : token.link.from;
					node = this.graph.findNodeByKey(target);
				}
				else 
					node = this.graph.findNodeByKey("nd1"); 
				
				var nextLink;

				token.rewrite = false;
				nextLink = node.transition(token, token.link);

				if (nextLink != null) {
					token.setLink(nextLink);
					token.transited = true;
					if (token.isMain) {	
						// prints progress
						// console.log(this.getData(token));
					}
				}
				else {
					token.transited = false;
					if (token.isMain) {
						token.setLink(null);
						this.setPlay(false);
						this.setPlaying(false);
						this.setFinished(true);
					}
					else
						token.setLink(token.link);
				}
			} else {
				var target = token.forward ? token.link.from : token.link.to;
				node = this.graph.findNodeByKey(target);
				var nextLink = node.rewrite(token, token.link);
				if (!token.rewrite) {
					token.transited = false;
					this.tokenPass(token); 
				}
				else {
					token.setLink(nextLink);
				}
			}
		}

		getData(token) {
			var dataStack = Array.from(token.dataStack).reverse();
			dataStack.push('□');

			// the latest value is stored in the first element in the dataStack
			var data = dataStack[0];

			// data consists of the last node and it's link
			// TODO: need to make a distinction between abstraction and anything else
			if (data[0] === 'λ' || data[1] !== '-') {
				var machine = this;
				// this means it doesn't return a simple value
				return function (source) {
					// TODO: needs to compile a new machine formed of 
					// current machine plus the one frm the arguments (???)
					const lexer = new Lexer(source + '\0');
					const parser = new Parser(lexer);
					const ast = parser.parse();
					console.log('ast');
					console.log(ast);
					// init
					machine.token.reset();
		
					machine.evalTokens = [];
					machine.cells = [];
					machine.readyEvalTokens = 0;
					machine.evaluating = false;
					machine.newValues.clear();
					machine.hasUpdate = false;

					// add to graph
					// TODO: needs to be abstraction
					var start = new Start().addToGroup(machine.graph.child);

					var app = new App().addToGroup(machine.graph.child);
					//lhs
					var left = machine.graph;
					var der = new Der(left.prin.name).addToGroup(machine.graph.child);
					new Link(der.key, left.prin.key, "n", "s").addToGroup(machine.graph.child);
					// rhs
					var right = this.toGraph(ast.rhs, machine.graph.child);		
					
					new Link(app.key, der.key, "w", "s").addToGroup(machine.graph.child);
					new Link(app.key, right.prin.key, "e", "s").addToGroup(machine.graph.child);

					var term = new Term(app, Term.joinAuxs(left.auxs, right.auxs, machine.graph.child));

					new Link(start.key, term.prin.key, "n", "s").addToGroup(machine.graph.child);
					machine.deleteVarNode(machine.graph.child);
				};
			} else {
				if (data[0] === '•') {
					// this represents the unit so it doesn't return anything
					return undefined;
				} else {
					return data[0];
				}
			}
		}

	}
	return new GoIMachine();	
});