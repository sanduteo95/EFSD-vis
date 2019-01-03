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

		draw(level) {
			var str = "";
			for (let node of this.nodes) {
				str += node.draw(level + '  ');
			}
			return level + 'subgraph cluster_' + this.key + ' {' 
				 + level + '  graph[style=dotted];'
				 + str 
				 + level + '};';
		}
	}
	return Box;
});