Array.prototype.last = function() {
    return this[this.length-1];
}

require(["jquery", "goi-machine"],
	function ($, machine) {
		$("#btn-play").click(function(event) {
			machine.setPlay(false);
			machine.setPlaying(false);
			var source = $("#ta-program").val();
			machine.compile(source);
			machine.setPlay(true);
			machine.setFinished(false);
			if (!machine.isPlaying()) {
				autoPlay();
			}
		});

		function autoPlay () {
			machine.setPlaying(true);
			let data = "";
			if (!machine.isFinished()) {
				data = machine.pass();
			} 
			if (machine.isFinished()) {
				console.log('RESULT: ' + data);
				$("#ta-result").val(data);
			} else {
				$("#ta-result").val("Calculating...");
				if (machine.isPlay()) {
					setTimeout(autoPlay, 0);
				} else {
					machine.setPlaying(false);
				}
			}
		}
	}
);