define(['node', 'token'], function(Node, Token) {

	var CompData = Token.CompData();

	class Const extends Node {

		constructor(name) {
			super(null, name, "mediumpurple1", name);
		}
		
		transition(token, link) {
			if (token.dataStack[token.dataStack.length - 1] == CompData.PROMPT) {
				token.dataStack.pop();
				token.dataStack.push([this.name,CompData.EMPTY]);
				token.forward = false;
				return link;
			}
		}

		copy() {
			return new Const(this.name);
		}
	}

	return Const;
});