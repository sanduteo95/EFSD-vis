define(['nodes/der', 'nodes/abs', 'nodes/expo'], 
    function(Der, Abs, Expo) {

	class Var extends Der {

		constructor(name) {
			super(name);
			this.text = "V";
		}

		deleteAndPreserveOutLink() { 
			var inLink = this.findLinksInto(null)[0];
			var outLink = this.findLinksOutOf(null)[0];
			var inNode = this.graph.findNodeByKey(inLink.from);
			if (inLink != null && outLink != null) {
				if (this.graph.findNodeByKey(outLink.to) instanceof Abs && (inNode instanceof Expo))
					outLink.changeFrom(inLink.from, "nw");
				else
					outLink.changeFrom(inLink.from, inLink.fromPort);
			}
			this.delete();
		}
	}

	return Var;
});