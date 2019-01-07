var showKey = false;

define(['helper'], function(Helper) {

	class Node {

		constructor(shape, text, colour, name) {
			this.key = null;
			this.shape = shape;
			this.text = text;
			this.colour = colour;
			this.name = name; // identifier name or constant name if any
			this.graph = null;
			this.group = null;
			this.width = null;
			this.height = null;
			this.links = [];
			this.addToGraph(Helper.mainGraph); // cheating!
		}

		addToGraph(graph) {
			if (graph != null)
				graph.addNode(this);
			this.graph = graph;
			return this; // to provide chain operation
		}

		addToGroup(group) {
			group.addNode(this);
			this.group = group;
			return this; // to provide chain operation
		}

		changeToGroup(group) {
			this.group.removeNode(this);
			this.addToGroup(group);
			return this;
		}

		findLinksConnected() {
			return this.links;
		}

		findLinksInto(toPort) {
			var links = [];
			for (let link of this.links) {
				if (link.to == this.key && (toPort == null ? true : link.toPort == toPort))
					links.push(link);
			}
			return links;
		}

		findLinksOutOf(fromPort) {
			var links = [];
			for (let link of this.links) {
				if (link.from == this.key && (fromPort == null ? true : link.fromPort == fromPort))
					links.push(link);
			}
			return links;
		}

		copy(graph) {
			var newNode = new Node(this.shape, this.text, this.name).addToGraph(graph);
			newNode.width = this.width;
			newNode.height = this.height;
		}	

		// also delete any connected links
		delete() {
			this.group.removeNode(this);
			this.graph.removeNode(this);
		}

		// machine instructions
		transition(token, link) {
			return link;
		}

		rewrite(token, nextLink) {
			token.rewrite = false;
			return nextLink;
		}
	}

	return Node;
});