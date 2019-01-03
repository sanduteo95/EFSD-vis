define(['node', 'token'], function(Node, Token) {

	var CompData = Token.CompData();

	class Start extends Node {

		constructor() {
			super("point", "", "black");
		}
		
		transition(token) {
			if (token.link == null && token.dataStack.last() == CompData.PROMPT) {
				var nextLink = this.findLinksOutOf(null)[0];
				token.forward = true;
				return nextLink;
			}
			else 
				return null;
		}
		
		copy() {
			return new Start();
		}

		draw(level) {
			return level + this.key + '[shape=' + this.shape + '];'; 
		}

	}

	return Start;
});