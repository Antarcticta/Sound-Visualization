var song;
var slider;
var toggleButton;
var stopButton;
var amplitude;
var fft;
var hue;
var hueStep;

function preload() {
	song = loadSound("bach.mp3");
	song.playMode('restart');
	song.loop();
}

function setup() {
	createCanvas(512, 512);

	angleMode(DEGREES);
	colorMode(HSB);
	hue = 0;
	hueStep = 0.2;

	// volume slider
	slider = createSlider(0, 1, 0.25, 0.01);

	// play/pause button
	toggleButton = createButton('►II');
	toggleButton.mousePressed(toggle);

	stopButton = createButton('■');
	stopButton.mousePressed(stopSong);

	// play the music
	song.play();

	// use this to analyze the volume
	amplitude = new p5.Amplitude();

	// use this for FFT analysis
	fft = new p5.FFT(0.85, 128);
}

function draw() {
	stroke(hue, 255, 255);
	fill(hue, 255, 255);
	background(0);

	// get the fft analysis in a variable
	var spectrum = fft.analyze();

	// get the amplitude analysis in a variable
	var amplitudeLevel = amplitude.getLevel();

	// use the volume slider
	song.setVolume(slider.value());

	// CALL VISUALIZATION FUNCTION OF CHOICE
	// THIS IS WHAT DRAWS THE VISUALIZATION
	circleLinesWithAmpDraw(spectrum, amplitudeLevel, 50);

	if (hue >= 255) {
		hueStep *= -1;
	}
	if (hue < 0) {
		hueStep *= -1;
	}
	hue += hueStep;
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

function circleLinesWithAmpDraw(spectrum, amplitudeLevel, hole_size) {
	translate(width/2, height/2);

	for (var i = 0; i < spectrum.length; i++) {
		var angle = map(i, 0, spectrum.length, 0, 360);
		var amp = spectrum[i];
		var r = map(amp, 0, 256, 150, 250);

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

function barGraphLinesDraw(spectrum) {
	var w = width / spectrum.length;

	for (var i = 0; i < spectrum.length; i++) {
		var amp = spectrum[i];
		var y = map(amp, 0, 256, height, height/4);

		line(i*w, height, i*w, y);
	}
}

function barGraphRectDraw(spectrum, spacing) {
	var w = width / spectrum.length;

	for (var i = 0; i < spectrum.length; i++) {
		var amp = spectrum[i];
		var y = map(amp, 0, 256, height, 0);

		rect(i*w, y, w-spacing, height-y);
	}
}

function barGraphWithAmpDraw(spectrum, amplitudeLevel) {
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

	// REMAKE THIS SO IT MAKES MORE SENSE WITH THE LINE OVER TOP OF THE THING
}

function Draw(spectrum) {

}

// MAKE SOMETHING WITH PARTICLES/POINTS HERE
