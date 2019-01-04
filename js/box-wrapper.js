define(['link', 'term', 'box', 'nodes/promo'], 
    function(Link, Term, Box, Promo) {

	// !-box 
	class BoxWrapper extends Term {

		constructor(prin, box, auxs) {
			super(prin, auxs);
			this.box = box;
		}

		static create() {
			var wrapper = new BoxWrapper();
			var box = new Box().addToGroup(wrapper);
			var promo = new Promo().addToGroup(wrapper);
			wrapper.set(promo, box, []);
			return wrapper;
		}

		set(prin, box, auxs) {
			super.set(prin, auxs);
			this.box = box;
		}

		removeAux(aux) {
			this.auxs.splice(this.auxs.indexOf(aux), 1);
			aux.deleteAndPreserveOutLink();
		}

		moveOut() {
			for (let link of Array.from(this.box.links)) {
				link.changeToGroup(this.group);
			}
			for (let link of Array.from(this.links)) {
				link.changeToGroup(this.group);
			}
			for (let node of Array.from(this.box.nodes)) {
				node.changeToGroup(this.group);
			}
			for (let aux of Array.from(this.auxs)) {
				aux.changeToGroup(this.group);
			}
			this.prin.changeToGroup(this.group);
			for (let node of Array.from(this.nodes)) {
				node.changeToGroup(this.group);
			}
		}

		copyBox(map) {
			var newBoxWrapper = new BoxWrapper();
			var newPrin = this.prin.copy().addToGroup(newBoxWrapper);
			newBoxWrapper.prin = newPrin;
			map.set(this.prin.key, newPrin.key);

			var newBox = new Box().addToGroup(newBoxWrapper);
			newBoxWrapper.box = newBox;

			newBoxWrapper.auxs = [];
			for (let node of this.box.nodes) {
				var newNode;
				if (node instanceof BoxWrapper) {
					newNode = node.copyBox(map).addToGroup(newBox);
				}
				else {
					var newNode = node.copy().addToGroup(newBox);
					map.set(node.key, newNode.key);
				}
			}
			for (let aux of this.auxs) {
				var newAux = aux.copy().addToGroup(newBoxWrapper);
				newBoxWrapper.auxs.push(newAux);
				map.set(aux.key, newAux.key);
			}

			for (let link of this.box.links) {
				var newLink = new Link(map.get(link.from), map.get(link.to), link.fromPort, link.toPort).addToGroup(newBox);
				newLink.reverse = link.reverse;
			}
			for (let link of this.links) {
				var newLink = new Link(map.get(link.from), map.get(link.to), link.fromPort, link.toPort).addToGroup(newBoxWrapper);
				newLink.reverse = link.reverse;
			}

			return newBoxWrapper;
		}

		copy() {
			var map = new Map();
			return this.copyBox(map);
		}

		delete() {
			this.box.delete();
			for (let aux of Array.from(this.auxs)) {
				aux.delete();
			}
			this.prin.delete();
			super.delete();
		}

		deleteAndPreserveLink() {
			this.box.delete();
			for (let aux of Array.from(this.auxs)) {
				this.removeAux(aux); // preserve outLink
			}
			this.prin.deleteAndPreserveInLink(); //preserve inLink
			super.delete();
		}
	}

	return BoxWrapper;
});