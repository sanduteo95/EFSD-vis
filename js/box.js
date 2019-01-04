define(['group'], function(Group) {

    // general box-ed subgraph
	class Box extends Group {
		constructor() {
			super();
			this.nodes = [];
			this.links = [];
		}

		copy(graph) {
			// this shouldnt be call, since every box should be inside a wrapper
		}
	}
	return Box;
});