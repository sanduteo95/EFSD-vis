define(['node'], function(Node) {

	// general group in a graph (subgraph)
	class Group extends Node {
		constructor() {
			super(null, null, null); // shape, text, name
			this.nodes = [];
			this.links = []; // for copying
		}

		addNode(node) {
			this.nodes.push(node);
		}

		removeNode(node) {
			return this.nodes.splice(this.nodes.indexOf(node), 1);
		}

		addLink(link) {
			this.links.push(link);
		}

		removeLink(link) {
			var i = this.links.indexOf(link);
			if (i != -1)
				this.links.splice(i, 1);
		}

		delete() {
			for (let node of Array.from(this.nodes)) {
				node.delete();
			}
			super.delete();
		}
	}
	return Group;
});
