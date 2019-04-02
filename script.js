for(i=0;i<25; i++) {
	for(j=0;j<9; j++) {
		$("#mainContent").html($("#mainContent").html() + "<div class='cell targetable'></div>");
	}
	for(j=0;j<41; j++) {
		$("#mainContent").html($("#mainContent").html() + "<div class='cell'></div>");
	}
}

var phase = "targetting";
var catapultAxis = [9, 15];
var hoverColor = "";
var trajectoryMapY = [];
var trajectoryMapXLeft = [];
var trajectoryMapXRight = [];
var landedDistance = 0;
var vertexheight = 0;
var speedAmplifier = 2;
var ShotFinished = 0;

var skyColor = 9079129189;
var groundColor = 9023157079;
var catapultColor = 9119077043;
var pathColor = 9100000000;
var landedColor = 9255255255;
var ballColor = "rgb(231, 017, 030)";

function startSimulation() {


	//Group layers from back to front
	//Set indefinitely
	if(document.querySelector("#erase").checked) {
		for(i=0;i<=49; i++) {
			for(j=0;j<=25; j++) {
				setColors(i, j, skyColor);
			}
		}
		for(i=0;i<=49; i++) {
			for(j=20;j<=25; j++) {
				setColors(i, j, groundColor);
			}
		}
		for(i=17; i<20; i++) {
			setColors(9, i, catapultColor);
		}
		setColors(8, 16, catapultColor);
		setColors(10, 16, catapultColor);
		setColors(7, 15, catapultColor);
		setColors(11, 15, catapultColor);
	}
	$(".targetting>.cell.targetable").hover(function() {
		if(phase == "targetting") {
			hoverColor = $(this).css("background-color");
			$(this).css("background-color", ballColor);
		}
	}, function() {
		if(phase == "targetting") {
	    	$(this).css("background-color", hoverColor)
		}
	});

	$(".targetting>.cell.targetable").click(function(){
		if(phase == "targetting") {
			var foundCellx = 0;
			var foundCelly = 0;
			for(i=0;i<50;i++) {
				for(j=0;j<25; j++) {
					if($(".cell").eq((50 * (j)) + (i))[0] == this) {
						foundCellx = i;
						foundCelly = j;
					}
				}
			}

			$("#mainContent").removeClass("targetting");
			phase = "shooting";
			//Find angle theta and velocity for formula
			var displacementx = (catapultAxis[0] - foundCellx);
			var displacementy = -1 * (catapultAxis[1] - foundCelly);
			//alert(displacementx + ", " + displacementy);

			var angle = 90-Math.atan(displacementx/displacementy) * 180 / Math.PI || 0;
			var speed = Math.sqrt(Math.pow(displacementx, 2) + Math.pow(displacementy, 2))

			//alert("An angle of " + angle + " degrees and a diagonal of " + speed + " units");
			calculateY(angle, speed);
			calculateXRight(angle, speed);
			calculateXLeft(angle, speed);

			ShotFinished = 1;
		}
	})

	//x goes from 0 to 49
	//y goes from 0 to 24

	//Use rgbval as a 10 digit interger, then convert to rgb value. Digit 1 will always be 9.
	function setColors(x, y, rgbval) {
		if(Math.round(x) < 50 && Math.round(x) > -1 && Math.round(y) < 25 && Math.round(y) > -1) {
			var color = "rgb(" + rgbval.toString().charAt(1) + rgbval.toString().charAt(2) + rgbval.toString().charAt(3) + ", " + rgbval.toString().charAt(4) + rgbval.toString().charAt(5) + rgbval.toString().charAt(6) + ", " + rgbval.toString().charAt(7) + rgbval.toString().charAt(8) + rgbval.toString().charAt(9) + ")";
			$(".cell").eq((50 * (Math.round(y))) + (Math.round(x))).css("background-color", color);
		}
	}

	function calculateY(ang, speed) {
		var displacement = 9;
		var height = -15;
		var angle = ang;
		var velocity = speed * speedAmplifier;
		for(i=9;i<51; i++) {
			trajectoryMapY[i] = (-1 * ((height - 4.9 * Math.pow(((i) - displacement) / (velocity * Math.cos(angle * Math.PI / 180)), 2) + Math.tan(angle * Math.PI / 180) * ((i) - displacement))));
			setColors(i, trajectoryMapY[i], pathColor);
		}
		// $("#angle").html(Math.round(100 * angle)/100 + "&#176; (" + Math.round(angle * Math.PI / 1.8)/100 + " radians)");
		// $("#velocity").html(Math.round(velocity * 100)/100 + "m/s (" + Math.round(velocity * 328.084)/100 + "ft/s)");
		console.log(trajectoryMapY);
	}

	function calculateXLeft(ang, speed) {
		var displacement = 9;
		var height = -15;
		var angle = ang;
		var velocity = speed * speedAmplifier;
		for(i=0;i<25;i++) {
			//Pain for second equation:
			trajectoryMapXLeft[i] = (

				(9.8 * displacement) + (Math.pow(velocity, 2) * Math.pow(Math.cos(0.01745 * angle), 2) * Math.tan(0.01745 * angle)) -
				(Math.sqrt(
					(Math.pow(velocity, 4) * Math.pow(Math.cos(0.01745 * angle), 4) * Math.pow(Math.tan(0.01745 * angle), 2)) +
						(19.6 * height * Math.pow(velocity, 2) * Math.pow(Math.cos(0.01745 * angle), 2)) +
						 (19.6 * i * Math.pow(velocity, 2) * Math.pow(Math.cos(0.01745 * angle), 2)) + 
						 	Math.pow(2.0, -14 * Math.pow(displacement, 2))
				))

			)/9.8;
			if(trajectoryMapXLeft[i] < 9) {
				trajectoryMapXLeft[i] = NaN;
			}
			setColors(trajectoryMapXLeft[i], i, pathColor);
		}
	}

	function calculateXRight(ang, speed) { //Generate trajectory data shown to viewer too
		var displacement = 9;
		var height = -15;
		var angle = ang;
		var velocity = speed * speedAmplifier;
		for(i=0;i<25;i++) {
			//Pain for second equation:
			trajectoryMapXRight[i] = (

				(9.8 * displacement) + (Math.pow(velocity, 2) * Math.pow(Math.cos(0.01745 * angle), 2) * Math.tan(0.01745 * angle)) +
				(Math.sqrt(
					(Math.pow(velocity, 4) * Math.pow(Math.cos(0.01745 * angle), 4) * Math.pow(Math.tan(0.01745 * angle), 2)) +
						(19.6 * height * Math.pow(velocity, 2) * Math.pow(Math.cos(0.01745 * angle), 2)) +
						 (19.6 * i * Math.pow(velocity, 2) * Math.pow(Math.cos(0.01745 * angle), 2)) + 
						 	Math.pow(2.0, -14 * Math.pow(displacement, 2))
				))

			)/9.8;
			if(trajectoryMapXRight[i] < 9) {
				trajectoryMapXRight[i] = NaN;
			}	
			setColors(trajectoryMapXRight[i], i, pathColor);
		}
		setColors(trajectoryMapXRight[19], 19, landedColor);
		var landedDistance = trajectoryMapXRight[19];

		var tempAng = angle;
		if(angle > 90) {
			tempAng = angle - 180;
			// alert(angle);
		}
		$("#angle").html(Math.round(100 * tempAng)/100 + "&#176; (" + Math.round(tempAng * Math.PI / 1.8)/100 + " radians)");
		$("#velocity").html(Math.round(velocity * 100)/100 + "m/s (" + Math.round(velocity * 328.084)/100 + "ft/s)");
		$("#distance").html(Math.round(landedDistance * 100)/100 + "m (" + Math.round(landedDistance * 328.084)/100 + "ft)");
	}
}
startSimulation();
$("#reset").click(function(){
	if(ShotFinished == 1) {
		phase = "targetting";
		startSimulation();
	}
})
$("#amplifier").change(function(){
	if($(this).val() <= 0) {
		$(this).val(1);
	}
	speedAmplifier = $(this).val();
})