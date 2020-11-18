var audio;
var slider;
var toggleButton;
var stopButton;
var loopCheckbox;
var amplitude;
var fft;
var hu;
var hueStep;
var modeSelect;
var mode = 1;
var modeOptions = [];
var input;
// var canvas;

function preload() {
	audio = loadSound("bach.mp3");
	sleep(1000);
	audio.playMode('restart');
	audio.loop();
}

// runs before the first frame is drawn
function setup() {
	canvas = createCanvas(512, 512);

	angleMode(DEGREES);
	colorMode(HSB);
	hu = 0;
	hueStep = 0;

	// volume slider
	slider = createSlider(0, 1, 0.5, 0.01);
	slider.position(width-140, 10);

	// play/pause button
	toggleButton = createButton('►II');
	toggleButton.mousePressed(toggle);
	toggleButton.position(10, 10);

	// button to stop the song
	stopButton = createButton('■');
	stopButton.mousePressed(stopAudio);
	stopButton.position(50, 10);

	// for the different options of visualizations
	modeOptions = ['Circle', 'Circle with Amplitude', 'Circle of Lines', 'Circle of Lines with Hole',
								'Circle of Lines with Amplitude', 'Circle of Circles', 'Circle of Circles with Amplitude',
								'Circle of Points', 'Circle of Points With Lines',
								'Connected Circle', 'Connected Circle with Amplitude', 'Bar Graph', 'Bar Graph with Amplitude',
								'Bar Graph of Lines', 'Bar Graph of Lines with Amplitude',
								'Bar Graph of Rectangles'];

	modeSelect = createSelect();
	for (var i = 0; i < modeOptions.length; i++) {
		modeSelect.option(modeOptions[i]);
	}
	modeSelect.selected(modeOptions[1]);
	modeSelect.position(515, 10);
	modeSelect.changed(modeChanged);

	// use this to toggle the looping of the file
	loopCheckbox = createCheckbox('Loop', true);
	loopCheckbox.changed(loopToggled);

	// for the user-inputted files
	input = createFileInput(handleFile);

	// set up the canvas to receive drag&dropped files
	canvas.drop(handleFile);

	// use this object to analyze the volume
	amplitude = new p5.Amplitude();

	// use this for FFT analysis
	fft = new p5.FFT(0.8, 128);
}

function draw() {
	stroke(hu, 255, 255);
	fill(hu, 255, 255);
	background(0);

	// get the fft analysis in a variable
	var spectrum = fft.analyze();

	// get the amplitude analysis in a variable
	var amplitudeLevel = amplitude.getLevel();

	// use the volume slider
	audio.setVolume(slider.value());

	// this draws the visualization the user has chosen
	drawAccordingToMode(mode, spectrum, amplitudeLevel);

	// if the color is too close to the max or min,
	// make it go in the other direction
	if (hu >= 240) {
		hueStep *= -1;
	}
	if (hu < 0) {
		hueStep *= -1;
	}
	// change the color of everything
	hu += hueStep;
}

// for when the play/pause button is clicked
function toggle() {
	if (audio.isPlaying()) {
		hueStep = 0;
		audio.pause();
	} else {
		hueStep = 0.2;
		audio.play();
	}
}

// for when the stop button is pressed (resets the sound file)
function stopAudio() {
	audio.stop();
}

// to handle when the mode is changed
function modeChanged() {
	var selected = modeSelect.value();
	mode = modeOptions.indexOf(selected);
}

// to toggle looping
function loopToggled() {
	audio.setLoop(this.checked());
}

// for when a file is inputted
function handleFile(file) {
	print(file.name);
	if (file.type === 'audio') {
		stopAudio();
		audio = loadSound(file.data);
		sleep(2000);
		audio.play();
	} else {
		print("This file is not the correct format");
	}
}

// this is called when a key is pressed
function keyTyped() {
	if (key === ' ') {
		toggle();
	}
}

// this is called when the mouse is pressed
function mousePressed() {
	if (mouseY > 30 && mouseX < width) {
		toggle();
	}
}

// use this when files need to load
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

// this will draw the correct visualization based on the mode given
function drawAccordingToMode(mode, spectrum, amplitudeLevel) {
	switch (mode) {
		case 0:
			circleDraw(spectrum);
			return;
		case 1:
			circleWithAmpDraw(spectrum, amplitudeLevel);
			return;
		case 2:
			circleLinesDraw(spectrum);
			return;
		case 3:
			circleLinesHoleDraw(spectrum, 50);
			return;
		case 4:
			circleLinesWithAmpDraw(spectrum, amplitudeLevel, 50);
			return;
		case 5:
			circleOfCirclesDraw(spectrum);
			return;
		case 6:
			circleOfCirclesWithAmpDraw(spectrum, amplitudeLevel);
			return;
		case 7:
			circlePointsDraw(spectrum);
			return;
		case 8:
			circlePointsWithLinesDraw(spectrum);
			return;
		case 9:
			connectedCircleDraw(spectrum);
			return;
		case 10:
			connectedCircleWithAmpDraw(spectrum, amplitudeLevel);
			return;
		case 11:
			barGraphDraw(spectrum);
			return;
		case 12:
			barGraphWithAmpDraw(spectrum, amplitudeLevel);
			return;
		case 13:
			barGraphLinesDraw(spectrum);
			return;
		case 14:
			barGraphLinesWithAmpDraw(spectrum, amplitudeLevel);
			return;
		case 15:
			barGraphRectDraw(spectrum, 2);
			return;
	}
}

// DRAWING FUNCTIONS
// These are for drawing the visualization.

// Circle of lines
function circleLinesDraw(spectrum) {
	// usually (0, 0) is in the top left
	// this makes it the center
	translate(width/2, height/2);

	for (var i = 0; i < spectrum.length; i++) {
		var angle = map(i, 0, spectrum.length, 0, 360);
		var amp = spectrum[i];
		var r = map(amp, 0, 256, 100, 250);

		// find the rotated version of the point (0, r)
		var x = r * cos(angle);
		var y = r * sin(angle);

		// then draw a line from the center to that point
		line(0, 0, x, y);
	}
}

// Circle of lines with a hole in the middle
function circleLinesHoleDraw(spectrum, hole_size) {
	translate(width/2, height/2);

	for (var i = 0; i < spectrum.length; i++) {
		var angle = map(i, 0, spectrum.length, 0, 360);
		var amp = spectrum[i];
		var r = map(amp, 0, 256, 100, 250);

		// find the rotated version of a point "hole_size" pixels from the center
		var x1 = hole_size * cos(angle);
		var y1 = hole_size * sin(angle);

		var x2 = r * cos(angle);
		var y2 = r * sin(angle);

		line(x1, y1, x2, y2);
	}
}

// Circle of lines with the volume level represented in the middle
function circleLinesWithAmpDraw(spectrum, amplitudeLevel, hole_size) {
	translate(width/2, height/2);

	for (var i = 0; i < spectrum.length; i++) {
		var angle = map(i, 0, spectrum.length, 0, 360);
		var amp = spectrum[i];
		var r = map(amp, 0, 256, 125, 250);

		var x2 = r * cos(angle);
		var y2 = r * sin(angle);

		line(0, 0, x2, y2);
	}

	var radius1 = map(amplitudeLevel, 0, 1, 200, 300);
	var radius2 = map(amplitudeLevel, 0, 1, 100, 275);
	var radius3 = map(amplitudeLevel, 0, 1, 50, 250);

	stroke(255);

	fill(16);
	ellipse(0, 0, radius1, radius1);
	fill(40);
	ellipse(0, 0, radius2, radius2);
	fill(100);
	ellipse(0, 0, radius3, radius3);
}

// Circle connected as one shape
function circleDraw(spectrum) {
	translate(width/2, height/2);

	beginShape();

	for (var i = 0; i < spectrum.length; i++) {
		var angle = map(i, 0, spectrum.length, 0, 360);
		var amp = spectrum[i];
		var r = map(amp, 0, 256, 100, 250);

		var x = r * cos(angle);
		var y = r * sin(angle);

		vertex(x, y);
	}

	endShape();
}

function circleWithAmpDraw(spectrum, amplitudeLevel) {
	translate(width/2, height/2);

	var radius1 = map(amplitudeLevel, 0, 1, 200, 300);
	var radius2 = map(amplitudeLevel, 0, 1, 100, 275);
	var radius3 = map(amplitudeLevel, 0, 1, 50, 250);

	beginShape();

	for (var i = 0; i < spectrum.length; i++) {
		var angle = map(i, 0, spectrum.length, 0, 360);
		var amp = spectrum[i];
		var r = map(amp, 0, 256, 115, 250);
		var x = r * cos(angle);
		var y = r * sin(angle);
		vertex(x, y);
	}

	endShape();

	stroke(255);

	fill(16);
	ellipse(0, 0, radius1, radius1);
	fill(40);
	ellipse(0, 0, radius2, radius2);
	fill(100);
	ellipse(0, 0, radius3, radius3);
}

function circleOfCirclesDraw(spectrum) {
	translate(width/2, height/2);

	for (var i = 0; i < spectrum.length; i++) {
		var angle = map(i, 0, spectrum.length, 0, 360);
		var amp = spectrum[i];
		var r = map(amp, 0, 256, 125, 250);

		var x = r * cos(angle);
		var y = r * sin(angle);

		var radius = map(spectrum[i], 0, 256, 3, 12);

		ellipse(x, y, radius, radius);
	}
}

function circleOfCirclesWithAmpDraw(spectrum, amplitudeLevel) {
	translate(width/2, height/2);

	for (var i = 0; i < spectrum.length; i++) {
		var angle = map(i, 0, spectrum.length, 0, 360);
		var amp = spectrum[i];
		var r = map(amp, 0, 256, 125, 250);

		var x = r * cos(angle);
		var y = r * sin(angle);

		var radius = map(spectrum[i], 0, 256, 3, 12);

		ellipse(x, y, radius, radius);
	}

	var radius1 = map(amplitudeLevel, 0, 1, 200, 300);
	var radius2 = map(amplitudeLevel, 0, 1, 100, 275);
	var radius3 = map(amplitudeLevel, 0, 1, 50, 250);

	stroke(255);

	fill(16);
	ellipse(0, 0, radius1, radius1);
	fill(40);
	ellipse(0, 0, radius2, radius2);
	fill(100);
	ellipse(0, 0, radius3, radius3);
}

function circlePointsDraw(spectrum) {
	translate(width/2, height/2);

	for (var i = 0; i < spectrum.length; i+=0.5) {
		if (i % 1 == 0) {
			var amp = spectrum[i];
		} else {
			var amp = (spectrum[i-0.5] + spectrum[i+0.5]) / 2;
		}
		var angle = map(i, 0, spectrum.length/3, 0, 720);
		var r = map(amp, 0, 256, 125, 250);

		var x = r * cos(angle);
		var y = r * sin(angle);

		strokeWeight(2);
		point(x, y);
	}
}

function circlePointsWithLinesDraw(spectrum) {
	translate(width/2, height/2);

	for (var i = 0; i < spectrum.length; i+=0.5) {
		if (i % 1 == 0) {
			var amp = spectrum[i];
		} else {
			var amp = (spectrum[i-0.5] + spectrum[i+0.5]) / 2;
		}
		var angle = map(i, 0, spectrum.length/3, 0, 720);
		var r = map(amp, 0, 256, 125, 250);

		var x = r * cos(angle);
		var y = r * sin(angle);

		strokeWeight(2);
		point(x, y);
	}

	for (var i = 0; i < spectrum.length; i++) {
		var angle = map(i, 0, spectrum.length, 0, 360);
		var amp = spectrum[i];
		var r = map(amp, 0, 256, 75, 150);
		var x = r * cos(angle);
		var y = r * sin(angle);
		line(0, 0, x, y);
	}
}

function connectedCircleDraw(spectrum) {
	translate(width/2, height/2);

	for (var i = 0; i < spectrum.length; i++) {
		var angle1 = map(i, 0, spectrum.length, 0, 360);
		var amp1 = spectrum[i];
		var r1 = map(amp1, 0, 256, 125, 250);

		var angle2 = map(constrain(i-1, 0, spectrum.length), 0, spectrum.length, 0, 360);
		var amp2 = spectrum[constrain(i-1, 0, spectrum.length)];
		var r2 = map(amp2, 0, 256, 125, 250);

		var x1 = r1 * cos(angle1);
		var y1 = r1 * sin(angle1);

		var x2 = r2 * cos(angle2);
		var y2 = r2 * sin(angle2);

		line(x1, y1, x2, y2);
	}
}

function connectedCircleWithAmpDraw(spectrum, amplitudeLevel) {
	translate(width/2, height/2);

	for (var i = 0; i < spectrum.length; i++) {
		var angle1 = map(i, 0, spectrum.length, 0, 360);
		var amp1 = spectrum[i];
		var r1 = map(amp1, 0, 256, 125, 250);

		var angle2 = map(constrain(i-1, 0, spectrum.length), 0, spectrum.length, 0, 360);
		var amp2 = spectrum[constrain(i-1, 0, spectrum.length)];
		var r2 = map(amp2, 0, 256, 125, 250);

		var x1 = r1 * cos(angle1);
		var y1 = r1 * sin(angle1);

		var x2 = r2 * cos(angle2);
		var y2 = r2 * sin(angle2);

		line(x1, y1, x2, y2);
	}

	var radius1 = map(amplitudeLevel, 0, 1, 200, 300);
	var radius2 = map(amplitudeLevel, 0, 1, 100, 275);
	var radius3 = map(amplitudeLevel, 0, 1, 50, 250);

	stroke(255);

	fill(16);
	ellipse(0, 0, radius1, radius1);
	fill(40);
	ellipse(0, 0, radius2, radius2);
	fill(100);
	ellipse(0, 0, radius3, radius3);
}

function barGraphDraw(spectrum) {
	var w = width / spectrum.length;

	beginShape();
	for (var i = 0; i < spectrum.length; i++) {
		var amp = spectrum[i];
		var y = map(amp, 0, 256, height, height/4);

		vertex(i*w, y);
	}
	vertex(width/2, height+1);
	vertex(0, height+1);
	endShape();
}

function barGraphWithAmpDraw(spectrum, amplitudeLevel) {
	var w = width / spectrum.length;

	beginShape();
	for (var i = 0; i < spectrum.length; i++) {
		var amp = spectrum[i];
		var y = map(amp, 0, 256, height, height/4);

		vertex(i*w, y);
	}
	vertex(width/2, height+1);
	vertex(0, height+1);
	endShape();

	var radius1 = map(amplitudeLevel, 0, 1, 200, 300);
	var radius2 = map(amplitudeLevel, 0, 1, 100, 275);
	var radius3 = map(amplitudeLevel, 0, 1, 50, 250);

	stroke(255);

	fill(16);
	ellipse(width/2, height/4, radius1, radius1);
	fill(40);
	ellipse(width/2, height/4, radius2, radius2);
	fill(100);
	ellipse(width/2, height/4, radius3, radius3);
}

function barGraphLinesDraw(spectrum) {
	var w = width / spectrum.length;

	for (var i = 0; i < spectrum.length; i++) {
		var amp = spectrum[i];
		var y = map(amp, 0, 256, height, height/4);

		line(i*w, height, i*w, y);
	}
}

function barGraphLinesWithAmpDraw(spectrum, amplitudeLevel) {
	var w = width / spectrum.length;

	for (var i = 0; i < spectrum.length; i++) {
		var amp = spectrum[i];
		var y = map(amp, 0, 256, height, height/4);

		line(i*w, height, i*w, y);
	}

	var radius1 = map(amplitudeLevel, 0, 1, 200, 300);
	var radius2 = map(amplitudeLevel, 0, 1, 100, 275);
	var radius3 = map(amplitudeLevel, 0, 1, 50, 250);

	stroke(255);

	fill(16);
	ellipse(width/2, height/4, radius1, radius1);
	fill(40);
	ellipse(width/2, height/4, radius2, radius2);
	fill(100);
	ellipse(width/2, height/4, radius3, radius3);
}

function barGraphRectDraw(spectrum, spacing) {
	var w = width / spectrum.length;

	for (var i = 0; i < spectrum.length; i++) {
		var amp = spectrum[i];
		var y = map(amp, 0, 256, height, 0);

		rect(i*w, y, w-spacing, height-y);
	}
}
