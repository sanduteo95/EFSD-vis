define(['group', 'link', 'nodes/pax', 'nodes/contract'], 
	function(Group, Link, Pax, Contract) {

	// specific group for a term in the calculus
	class Term extends Group {

		constructor(prin, auxs) {
			super();
			this.set(prin, auxs)
		}

		set(prin, auxs){
			this.prin = prin;
			this.auxs = auxs;
			return this;
		}

		createPaxsOnTopOf(auxs) {
			var newPaxs = [];
			for (let pax of auxs) {
				var newPax = new Pax(pax.name).addToGroup(this);
				
				if (pax.findLinksOutOf(null).length == 0)
					new Link(pax.key, newPax.key, "n", "s").addToGroup(this);
				else {
					var outLink = pax.findLinksOutOf(null)[0];
					new Link(newPax.key, outLink.to, "n", outLink.toPort).addToGroup(this.group);
					outLink.changeTo(newPax.key, "s");
					outLink.changeToGroup(this);
				}
				newPaxs.push(newPax);
			}
			return newPaxs;
		}

		static joinAuxs(leftAuxs, rightAuxs, group) {
			var newAuxs = leftAuxs.concat(rightAuxs);
			outter:
			for (let leftAux of leftAuxs) {
				for (let rightAux of rightAuxs) {
					if (leftAux.name == rightAux.name) {
						var con = new Contract(leftAux.name).addToGroup(group);

						var outLink = leftAux.findLinksOutOf(null)[0];
						if (typeof outLink != 'undefined') {
							outLink.changeFrom(con.key, outLink.fromPort);
						}

						new Link(rightAux.key, con.key, "n", "s").addToGroup(group);
						new Link(leftAux.key, con.key, "n", "s").addToGroup(group);
						newAuxs.splice(newAuxs.indexOf(leftAux), 1);
						newAuxs.splice(newAuxs.indexOf(rightAux), 1);
						newAuxs.push(con);

						continue outter;
					}
				}
			}
			return newAuxs;
		}
	}
	return Term;
});

