define(['node', 'token', 'link', 'box-wrapper', 'nodes/promo', 'nodes/const', 'op'], 
	function(Node, Token, Link, BoxWrapper, Promo, Const, Op) {

	var CompData = Token.CompData();
	var RewriteFlag = Token.RewriteFlag();
	var BinOpType = Op.BinOpType;

	class BinOp extends Node {

		constructor(text) {
			super(null, text, "mediumpurple1");
			this.subType = null;
		}
		
		transition(token, link) {
			if (link.to == this.key) {
				var nextLink = this.findLinksOutOf("e")[0];
				token.dataStack.push(CompData.PROMPT);
				return nextLink;
			}
			else if (link.from == this.key && link.fromPort == "e") {
				var nextLink = this.findLinksOutOf("w")[0];
				token.dataStack.push(CompData.PROMPT);
				token.forward = true;
				return nextLink;
			}
			else if (link.from == this.key && link.fromPort == "w") {
				if (token.dataStack[token.dataStack.length-3] == CompData.PROMPT) {
					var l = token.dataStack.pop();
					var r = token.dataStack.pop();
				 			token.dataStack.pop();
				 	var result = this.binOpApply(this.subType, l[0], r[0]);

					token.dataStack.push([result,CompData.EMPTY]);
					token.rewriteFlag = RewriteFlag.F_OP;	
					return this.findLinksInto(null)[0];;
				}	
			}
		}

		rewrite(token, nextLink) {
			if (token.rewriteFlag == RewriteFlag.F_OP && nextLink.to == this.key) {
				token.rewriteFlag = RewriteFlag.EMPTY;

				var left = this.graph.findNodeByKey(this.findLinksOutOf("w")[0].to);
				var right = this.graph.findNodeByKey(this.findLinksOutOf("e")[0].to);

				if (left instanceof Promo && right instanceof Promo) {
					var wrapper = BoxWrapper.create().addToGroup(this.group);
					var newConst = new Const(token.dataStack[token.dataStack.length - 1][0]).addToGroup(wrapper.box);
					new Link(wrapper.prin.key, newConst.key, "n", "s").addToGroup(wrapper);
					nextLink.changeTo(wrapper.prin.key, "s");
					
					left.group.delete();
					right.group.delete();
					this.delete();
				}
				
				token.rewrite = true;
				return nextLink;
			}
			
			else if (token.rewriteFlag == RewriteFlag.EMPTY) {
				token.rewrite = false;
				return nextLink;
			}
		}

		binOpApply(type, v1, v2) {
			switch(type) {
				case BinOpType.And: return v1 && v2;
				case BinOpType.Or: return v1 || v2;
				case BinOpType.Plus: return parseFloat(v1) + parseFloat(v2);
				case BinOpType.Sub: return parseFloat(v1) - parseFloat(v2);
				case BinOpType.Mult: return parseFloat(v1) * parseFloat(v2);
				case BinOpType.Div: return parseFloat(v1) / parseFloat(v2);
				case BinOpType.Lte: return parseFloat(v1) <= parseFloat(v2);
			}
		}

		static createPlus() {
			var node = new BinOp("+");
			node.subType = BinOpType.Plus;
			return node;
		}

		static createMult() {
			var node = new BinOp("*");
			node.subType = BinOpType.Mult;
			return node;
		}

		copy() {
			var newNode = new BinOp(this.text);
			newNode.subType = this.subType;
			return newNode;
		}
	}

	return BinOp;
});