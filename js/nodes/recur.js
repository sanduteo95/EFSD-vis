define(['node', 'token', 'term', 'link', 'nodes/expo'],
	function(Node, Token, Term, Link, Expo) {

	var CompData = Token.CompData();
	var RewriteFlag = Token.RewriteFlag();

	class Recur extends Expo {

		constructor() {
			super(null, "μ", "mediumpurple1");
		}

		transition(token, link) {
			if (link.to == this.key) {
				var nextLink = this.findLinksOutOf("e")[0];
				token.rewriteFlag = RewriteFlag.F_RECUR;
				return nextLink;
			}
		}

		rewrite(token, nextLink) {
			if (token.rewriteFlag == RewriteFlag.F_RECUR && nextLink.from == this.key) {
				token.rewriteFlag = RewriteFlag.EMPTY;

				var wrapper = this.group.copy().addToGroup(this.group);
				Term.joinAuxs(this.group.auxs, wrapper.auxs, wrapper.group);	

				var oldGroup = this.group;
				var oldBox = this.group.box;
				
				this.group.moveOut();

				var leftLink = this.findLinksInto("w")[0];
				leftLink.changeTo(wrapper.prin.key, "s");
				leftLink.fromPort = "n";
				leftLink.reverse = false;
				var inLink = this.findLinksInto("s")[0];
				var outLink = this.findLinksOutOf("e")[0];
				outLink.changeFrom(inLink.from, inLink.fromPort);
				
				oldGroup.deleteAndPreserveLink();

				token.rewrite = true;
				return nextLink;
			}

			else if (token.rewriteFlag == RewriteFlag.EMPTY) {
				token.rewrite = false;
				return nextLink;
			}
		}

		copy() {
			return new Recur();
		}
	}

	return Recur;
});