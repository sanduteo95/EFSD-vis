define(['node', 'token', 'box-wrapper', 'nodes/const', 'link', 'nodes/weak', 'helper'], 
	function(Node, Token, BoxWrapper, Const, Link, Weak, Helper) {

	var CompData = Token.CompData();
	var RewriteFlag = Token.RewriteFlag();

	class Dep extends Node {
		
		constructor() {
			super(null, 'p', "mediumpurple1");
		}

		transition(token, link) {
			if (link.to == this.key) {
				var nextLink = this.findLinksOutOf(null)[0]; 
				token.dataStack.push(CompData.PROMPT);
				return nextLink;
			}
			else if (link.from == this.key) {
				if (token.dataStack[token.dataStack.length-2] == CompData.PROMPT) {
					var data = token.dataStack.pop();
					token.dataStack.pop();
					token.dataStack.push([data[0],CompData.EMPTY]);
					token.rewriteFlag = RewriteFlag.F_DEP;
					return this.findLinksInto(null)[0]; 
				}
			}
		}

		rewrite(token, nextLink) {
			if (nextLink.to == this.key && token.rewriteFlag == RewriteFlag.F_DEP) {
				token.rewriteFlag = RewriteFlag.EMPTY;
				var data = token.dataStack[token.dataStack.length - 1];

				if ((Helper.isNumber(data[0]) || typeof(data[0]) === "boolean")) {
					var outLink = this.findLinksOutOf(null)[0]; 
					var weak = new Weak(outLink.text).addToGroup(this.group);
					outLink.changeFrom(weak.key, "n");

					var wrapper = BoxWrapper.create().addToGroup(this.group);
					var newConst = new Const(data[0]).addToGroup(wrapper.box);
					new Link(wrapper.prin.key, newConst.key, "n", "s").addToGroup(wrapper);
					nextLink.changeTo(wrapper.prin.key, "s");
					
					this.delete();
					token.rewrite = true;
				}

				return nextLink;
			}

			else if (token.rewriteFlag == RewriteFlag.EMPTY) {
				token.rewrite = false;
				return nextLink;
			}
		}

		copy() {
			return new Dep();
		}
	}

	return Dep;
});