define(['node', 'token', 'link', 'box-wrapper', 'nodes/promo', 'nodes/const', 'op'],
	function(Node, Token, Link, BoxWrapper, Promo, Const, Op) {

	var CompData = Token.CompData();
	var RewriteFlag = Token.RewriteFlag();
	var Link = require('link');
	var UnOpType = Op.UnOpType;

	class UnOp extends Node {

		constructor(text) {
			super(null, text, "mediumpurple1");
			this.subType = null;
		}

		transition(token, link) {
			if (link.to == this.key) {
				var nextLink = this.findLinksOutOf(null)[0];
				token.dataStack.push(CompData.PROMPT);
				return nextLink;
			}
			else if (link.from == this.key) {
				if (token.dataStack[token.dataStack.length-2] == CompData.PROMPT) {
					var v1 = token.dataStack.pop();
							 token.dataStack.pop();
					token.dataStack.push([this.unOpApply(this.subType, v1[0]),CompData.EMPTY]);
					token.rewriteFlag = RewriteFlag.F_OP;
					return this.findLinksInto(null)[0];
				}
			}
		}

		rewrite(token, nextLink) {
			if (token.rewriteFlag == RewriteFlag.F_OP && nextLink.to == this.key) {
				token.rewriteFlag = RewriteFlag.EMPTY;
				
				var prev = this.graph.findNodeByKey(this.findLinksOutOf(null)[0].to);
				if (prev instanceof Promo) {
					var wrapper = BoxWrapper.create().addToGroup(this.group);
					var newConst = new Const(token.dataStack[token.dataStack.length - 1][0]).addToGroup(wrapper.box);
					new Link(wrapper.prin.key, newConst.key, "n", "s").addToGroup(wrapper);
					nextLink.changeTo(wrapper.prin.key, "s");
					prev.group.delete(); 
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

		unOpApply(type, v1) {
			switch(type) {
				case UnOpType.Not: return !v1;
			}
		}

		copy() {
			var newNode = new UnOp(this.text);
			newNode.subType = this.subType;
			return newNode;
		}

	}

	return UnOp;
});