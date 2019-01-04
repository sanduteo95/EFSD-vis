define(['node', 'token', 'nodes/delta', 'nodes/weak', 'nodes/contract', 'helper'],
	function(Node, Token, Delta, Weak, Contract, Helper) {

	var CompData = Token.CompData();
	var RewriteFlag =Token.RewriteFlag();
	
	class Mod extends Node {
		
		constructor() {
			super(null, "M", "indianred1");
			this.graph.machine.cells.push(this.key);
		}

		transition(token, link) {
			if (link.to == this.key) {
				return this.findLinksOutOf("w")[0];
			}
			else if (link.from == this.key && link.fromPort == "w") {
				var data = token.dataStack.pop();
				token.dataStack.push([data[0],this.key])
				return this.findLinksInto(null)[0]; 
			}
			else if (link.from == this.key && link.fromPort == "e") {
				token.machine.newValues.set(this.key, token.dataStack.last()[0]);
				token.delete();
				return null;
			}
		}

		update(data) {
			var leftLink = this.findLinksOutOf("w")[0]; 

			if ((Helper.isNumber(data) || typeof(data) === "boolean")) {
				var value = this.graph.findNodeByKey(leftLink.to);
				var oldData = value.name;
				value.text = data;
				value.name = data;
				return oldData;
			}
		}

		copy() {
			var mod = new Mod();
			return mod;
		}
	}

	return Mod;
});