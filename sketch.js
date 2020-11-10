var song;
var slider;
var toggleButton;
var stopButton;
var loopCheckbox;
var amplitude;
var fft;
var hu;
var hueStep;
var particles = [];
var modeSelect;
var mode = 0;
var modeOptions = [];
var mic;
var input;

// import Particle from "./Particle.js";

function preload() {
	song = loadSound("bach.mp3");
	sleep(1000);
	song.playMode('restart');
	song.loop();
}

function setup() {
	createCanvas(512, 512);

	angleMode(DEGREES);
	colorMode(HSB);
	hu = 0;
	hueStep = 0.2;

	// volume slider
	slider = createSlider(0, 1, 0.25, 0.01);
	slider.position(width-140, 10);

	// play/pause button
	toggleButton = createButton('►II');
	toggleButton.mousePressed(toggle);
	toggleButton.position(10, 10);

	// button to stop the song
	stopButton = createButton('■');
	stopButton.mousePressed(stopSong);
	stopButton.position(50, 10);

	// for the different options of visualizations
	modeOptions = ['Circle', 'Circle with Amplitude', 'Circle of Lines', 'Circle of Lines with Hole',
								'Circle of Lines with Amplitude', 'Circle of Points', 'Circle of Points with Amplitude',
								'Connected Circle', 'Connected Circle with Amplitude', 'Bar Graph', 'Bar Graph with Amplitude',
								'Bar Graph of Lines', 'Bar Graph of Lines with Amplitude',
								'Bar Graph of Rectangles', 'Particles with Forces'];
	modeSelect = createSelect();
	for (var i = 0; i < modeOptions.length; i++) {
		modeSelect.option(modeOptions[i]);
	}
	modeSelect.selected(modeOptions[0]);
	modeSelect.position(130, 10);
	modeSelect.changed(modeChanged);

	// an empty paragraph object to space out the options
	createP('');

	// use this to toggle the looping of the file
	loopCheckbox = createCheckbox('Loop', true);
	loopCheckbox.changed(loopToggled);

	// for the user-inputted files
	input = createFileInput(handleFile);

	// decide how to use the microphone and then do it here:
	// mic = new p5.AudioIn();

	// play the music
	// I have commented this out because I would rather leave this open
	// to the user rather than pushing the 'default' file on them

	// song.play();

	// use this object to analyze the volume
	amplitude = new p5.Amplitude();

	// use this for FFT analysis
	fft = new p5.FFT(0.85, 128);

	for (var i = 0; i < 256; i++) {
		particles[i] = new Particle(random(width), random(height), random(1, 5));
	}

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
	song.setVolume(slider.value());

	// CALL VISUALIZATION FUNCTION OF CHOICE
	// THIS IS WHAT DRAWS THE VISUALIZATION
	drawAccordingToMode(mode, spectrum, amplitudeLevel);

	if (hu >= 255) {
		hueStep *= -1;
	}
	if (hu < 0) {
		hueStep *= -1;
	}
	hu += hueStep;
}

// for when the play/pause button is clicked
function toggle() {
	if (song.isPlaying()) {
		hueStep = 0;
		song.pause();
	} else {
		hueStep = 0.2;
		song.play();
	}
}

// for when the stop button is pressed (resets the sound file)
function stopSong() {
	song.stop();
}

function modeChanged() {
	var selected = modeSelect.value();
	mode = modeOptions.indexOf(selected);
}

function loopToggled() {
	if (this.checked()) {
		song.setLoop(true);
	} else {
		song.setLoop(false);
	}
}

function handleFile(file) {
	print(file);
	if (file.type === 'audio') {
		stopSong();
		song = loadSound(file.data);
		sleep(2000);
	} else {
		print("This file is not the correct format");
	}
}

// use this when things need to load
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

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
			circlePointsDraw(spectrum);
			return;
		case 6:
			circlePointsWithAmpDraw(spectrum, amplitudeLevel);
			return;
		case 7:
			connectedCircleDraw(spectrum);
			return;
		case 8:
			connectedCircleWithAmpDraw(spectrum, amplitudeLevel);
			return;
		case 9:
			barGraphDraw(spectrum);
			return;
		case 10:
			barGraphWithAmpDraw(spectrum, amplitudeLevel);
			return;
		case 11:
			barGraphLinesDraw(spectrum);
			return;
		case 12:
			barGraphLinesWithAmpDraw(spectrum, amplitudeLevel);
			return;
		case 13:
			barGraphRectDraw(spectrum, 2);
			return;
		case 14:
			particleForcesDraw(spectrum, particles);
			return;
	}
}

class Particle {

  constructor (x, y, size) {
    this.pos = createVector(x, y);
		this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.size = size;
  }

  addForce(force) {
    this.acc.add(force);
  }

  updateSelf() {
    this.vel.add(this.acc);
		this.vel = createVector(constrain(this.vel.x, -1, 1), constrain(this.vel.y, -1, 1));
		this.pos.add(this.vel);
		this.acc.mult(0);
  }

	edges() {
		if (this.pos.x > width) {this.pos.x = 0;}
		if (this.pos.x < 0) {this.pos.x = width;}
		if (this.pos.y > height) {this.pos.y = 0;}
		if (this.pos.y < 0) {this.pos.y = height;}
	}

	gravitateTowards(x, y) {
		// implement something for this particle to gravitate towards the given point
		// use this.addForce(____, ____);
	}

  drawSelf() {
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
  }
}

// DRAWING FUNCTIONS
// These are for drawing the visualization.
// Probably don't call these at the same time.
// Call these during draw.

// Circle of lines
function circleLinesDraw(spectrum) {
	translate(width/2, height/2);

	for (var i = 0; i < spectrum.length; i++) {
		var angle = map(i, 0, spectrum.length, 0, 360);
		var amp = spectrum[i];
		var r = map(amp, 0, 256, 100, 250);
		var x = r * cos(angle);
		var y = r * sin(angle);
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

		var x1 = hole_size * cos(angle);
		var y1 = hole_size * sin(angle);

		var x2 = r * cos(angle);
		var y2 = r * sin(angle);

		line(x1, y1, x2, y2);
	}
}

// circle of lines with the ampltiude in the middle
function circleLinesWithAmpDraw(spectrum, amplitudeLevel, hole_size) {
	translate(width/2, height/2);

	for (var i = 0; i < spectrum.length; i++) {
		var angle = map(i, 0, spectrum.length, 0, 360);
		var amp = spectrum[i];
		var r = map(amp, 0, 256, 125, 250);

		var x1 = hole_size * cos(angle);
		var y1 = hole_size * sin(angle);

		var x2 = r * cos(angle);
		var y2 = r * sin(angle);

		line(x1, y1, x2, y2);
	}

	var radius1 = map(amplitudeLevel, 0, 1, 200, 300);
	var radius2 = map(amplitudeLevel, 0, 1, 100, 150);
	var radius3 = map(amplitudeLevel, 0, 1, 50, 100);

	stroke(255);

	fill(16);
	ellipse(0, 0, radius1, radius1);
	fill(40);
	ellipse(0, 0, radius2, radius2);
	fill(100);
	ellipse(0, 0, radius3, radius3);
}

// Circle connected as one big shape
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
	var radius2 = map(amplitudeLevel, 0, 1, 100, 150);
	var radius3 = map(amplitudeLevel, 0, 1, 50, 100);

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

function circlePointsDraw(spectrum) {
	translate(width/2, height/2);

	for (var i = 0; i < spectrum.length; i++) {
		var angle = map(i, 0, spectrum.length, 0, 360);
		var amp = spectrum[i];
		var r = map(amp, 0, 256, 125, 250);

		var x = r * cos(angle);
		var y = r * sin(angle);

		strokeWeight(2);
		point(x, y);
	}
}

function circlePointsWithAmpDraw(spectrum, amplitudeLevel) {
	translate(width/2, height/2);

	for (var i = 0; i < spectrum.length; i++) {
		var angle = map(i, 0, spectrum.length, 0, 360);
		var amp = spectrum[i];
		var r = map(amp, 0, 256, 125, 250);

		var x = r * cos(angle);
		var y = r * sin(angle);

		strokeWeight(2);
		point(x, y);
	}

	var radius1 = map(amplitudeLevel, 0, 1, 200, 300);
	var radius2 = map(amplitudeLevel, 0, 1, 100, 150);
	var radius3 = map(amplitudeLevel, 0, 1, 50, 100);

	stroke(255);

	fill(16);
	ellipse(0, 0, radius1, radius1);
	fill(40);
	ellipse(0, 0, radius2, radius2);
	fill(100);
	ellipse(0, 0, radius3, radius3);
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
	var radius2 = map(amplitudeLevel, 0, 1, 100, 150);
	var radius3 = map(amplitudeLevel, 0, 1, 50, 100);

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
	var radius2 = map(amplitudeLevel, 0, 1, 100, 150);
	var radius3 = map(amplitudeLevel, 0, 1, 50, 100);

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
	var radius2 = map(amplitudeLevel, 0, 1, 100, 150);
	var radius3 = map(amplitudeLevel, 0, 1, 50, 100);

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

function particleForcesDraw(spectrum, particles) {
	var forces = [];
	var gravity = [];

	for (var i = 0; i < spectrum.length*2; i++) {
		// 	CREATE A UNIT VECTOR THAT POINTS IN A DIRECTION
		forces[i] = createVector(random(-1, 1), random(-1, 1));
	}

	for (var i = 0; i < particles.length; i++) {
		gravity[i] = createVector((width/2)-particles[i].pos.x, (height/2)-particles[i].pos.y);
	}

	for (var i = 0; i < particles.length; i++) {
		particles[i].addForce(forces[i]);
		particles[i].addForce(gravity[i]);
		particles[i].updateSelf();
		particles[i].edges();
		particles[i].drawSelf();
	}
}
