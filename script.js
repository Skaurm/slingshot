for(i=0;i<25; i++) { //Create the entire grid
	for(j=0;j<9; j++) {
		$("#mainContent").html($("#mainContent").html() + "<div class='cell targetable'></div>");
	}
	for(j=0;j<41; j++) {
		$("#mainContent").html($("#mainContent").html() + "<div class='cell'></div>");
	}
}

var phase = "targetting"; //Game state
var catapultAxis = [9, 15]; //Location of the pivot point for the slingshot
var hoverColor = "";

//Grid to map out coordinate values
var trajectoryMapY = [];
var trajectoryMapXLeft = [];
var trajectoryMapXRight = [];

var landedDistance = 0; //Values to be set when the projectile is launched
var vertexheight = 0;
var speedAmplifier = 2;

var ShotFinished = 0;

var skyColor = 9079129189; //Shortcuts for specific colours of grid blocks
var groundColor = 9023157079;
var catapultColor = 9119077043;
var pathColor = 9100000000;
var landedColor = 9255255255;
var ballColor = "rgb(231, 017, 030)";

function startSimulation() { //Start the simulation

	//Erase the grid if box is checked
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

		//Hardcode values for slingshot coordinates
		setColors(8, 16, catapultColor); 
		setColors(10, 16, catapultColor);
		setColors(7, 15, catapultColor);
		setColors(11, 15, catapultColor);
	}

	//Make hovered squares red
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

	//Run when a square is clicked
	$(".targetting>.cell.targetable").click(function(){
		if(phase == "targetting") {
			var foundCellx = 0;
			var foundCelly = 0;
			for(i=0;i<50;i++) {
				for(j=0;j<25; j++) {
					if($(".cell").eq((50 * (j)) + (i))[0] == this) {
						foundCellx = i; //Find the coordinates of the clicked square
						foundCelly = j;
					}
				}
			}

			//Establish that we are "shooting" now, and disable targetting
			$("#mainContent").removeClass("targetting");
			phase = "shooting";

			//Find the displacement between the slingshot pivot and the clicked square
			var displacementx = (catapultAxis[0] - foundCellx);
			var displacementy = -1 * (catapultAxis[1] - foundCelly);

			//Find angle theta and velocity for formula
			var angle = 90-Math.atan(displacementx/displacementy) * 180 / Math.PI || 0;
			//Use pythagoras's theorem to find velocity, given an arbitrary "base" speed
			var speed = Math.sqrt(Math.pow(displacementx, 2) + Math.pow(displacementy, 2))

			//write 
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

	//Equation 1: y = -x^2
	function calculateY(ang, speed) {
		var displacement = 9;
		var height = -15;
		var angle = ang;
		var velocity = speed * speedAmplifier;
		//Write y values for every x square
		for(i=9;i<51; i++) {
			trajectoryMapY[i] = (-1 * ((height - 4.9 * Math.pow(((i) - displacement) / (velocity * Math.cos(angle * Math.PI / 180)), 2) + Math.tan(angle * Math.PI / 180) * ((i) - displacement))));
			setColors(i, trajectoryMapY[i], pathColor);
		}
	}

	//Equation 2: x = +√y
	function calculateXLeft(ang, speed) {
		var displacement = 9;
		var height = -15;
		var angle = ang;
		var velocity = speed * speedAmplifier;
		//Write x values for every y square
		for(i=0;i<25;i++) {
			trajectoryMapXLeft[i] = (
				(9.8 * displacement) + (Math.pow(velocity, 2) * Math.pow(Math.cos(0.01745 * angle), 2) * Math.tan(0.01745 * angle)) -
				(Math.sqrt(
					(Math.pow(velocity, 4) * Math.pow(Math.cos(0.01745 * angle), 4) * Math.pow(Math.tan(0.01745 * angle), 2)) +
						(19.6 * height * Math.pow(velocity, 2) * Math.pow(Math.cos(0.01745 * angle), 2)) +
							(19.6 * i * Math.pow(velocity, 2) * Math.pow(Math.cos(0.01745 * angle), 2)) + 
						 		Math.pow(2.0, -14 * Math.pow(displacement, 2)
						 	)
						)
					)
			)/9.8;
			if(trajectoryMapXLeft[i] < 9) { //Only write squares to the right of the slingshot
				trajectoryMapXLeft[i] = NaN;
			}
			setColors(trajectoryMapXLeft[i], i, pathColor);
		}
	}

	//Equation 3: x = -√y
	function calculateXRight(ang, speed) { //Generate trajectory data shown to viewer too
		var displacement = 9;
		var height = -15;
		var angle = ang;
		var velocity = speed * speedAmplifier;
		for(i=0;i<25;i++) {
			trajectoryMapXRight[i] = (
				(9.8 * displacement) + (Math.pow(velocity, 2) * Math.pow(Math.cos(0.01745 * angle), 2) * Math.tan(0.01745 * angle)) +
				(Math.sqrt(
					(Math.pow(velocity, 4) * Math.pow(Math.cos(0.01745 * angle), 4) * Math.pow(Math.tan(0.01745 * angle), 2)) +
						(19.6 * height * Math.pow(velocity, 2) * Math.pow(Math.cos(0.01745 * angle), 2)) +
							(19.6 * i * Math.pow(velocity, 2) * Math.pow(Math.cos(0.01745 * angle), 2)) + 
						 		Math.pow(2.0, -14 * Math.pow(displacement, 2)
						)
					)
				)
			)/9.8;
			if(trajectoryMapXRight[i] < 9) { //Only write squares to the right of the slingshot
				trajectoryMapXRight[i] = NaN;
			}	
			setColors(trajectoryMapXRight[i], i, pathColor);
		}

		//When the y on descent is equal to 19, it has hit the ground
		setColors(trajectoryMapXRight[19], 19, landedColor);
		var landedDistance = trajectoryMapXRight[19];

		var tempAng = angle;
		if(angle > 90) {
			tempAng = angle - 180;
		}

		//Update the html elements to show the values
		$("#angle").html(Math.round(100 * tempAng)/100 + "&#176; (" + Math.round(tempAng * Math.PI / 1.8)/100 + " radians)");
		$("#velocity").html(Math.round(velocity * 100)/100 + "m/s (" + Math.round(velocity * 328.084)/100 + "ft/s)");
		$("#distance").html(Math.round((landedDistance - 9) * 100)/100 + "m (" + Math.round((landedDistance - 9) * 328.084)/100 + "ft)");
	}
}


startSimulation();
//Restart simulation if the reset button is pressed
$("#reset").click(function(){
	if(ShotFinished == 1) {
		phase = "targetting";
		startSimulation();
	}
})
//Update the value of the speed amplifier
$("#amplifier").change(function(){
	if($(this).val() <= 0) {
		$(this).val(1);
	}
	speedAmplifier = $(this).val();
})
