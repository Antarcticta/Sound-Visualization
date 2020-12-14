var audio;
var slider;
var timeline;
var previousTime;
var timeInSeconds;
var timeDisplay;
var toggleButton;
var stopButton;
var muteButton;
var loopCheckbox;
var amplitude;
var fft;
var hu;
var hueStep;
var modeSelect;
var mode = 1;
var modeOptions = [];
var input;
var canvas;
var previousVolume;
var playing;

function preload() {
	audio = loadSound("bach.mp3");
	audio.playMode('sustain');
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

	// timeline slider
	calibrateTimeline();

	// play/pause button
	toggleButton = createButton('►II');
	toggleButton.mousePressed(toggle);
	toggleButton.position(10, 10);

	// button to stop the song
	stopButton = createButton('■');
	stopButton.mousePressed(stopAudio);
	stopButton.position(50, 10);

	// mute button
	muteButton = createButton('Mute');
	muteButton.mousePressed(toggleMute);
	muteButton.position(457, 35);

	// for the different options of visualizations
	modeOptions = ['Circle', 'Circle with Amplitude', 'Circle of Lines', 'Circle of Lines with Hole',
								'Circle of Lines with Amplitude', 'Circle of Circles', 'Circle of Circles with Amplitude',
								'Circle of Points', 'Circle of Points With Lines',
								'Connected Circle', 'Connected Circle with Amplitude', 'Bar Graph', 'Bar Graph with Amplitude',
								'Bar Graph of Lines', 'Bar Graph of Lines with Amplitude', 'Symmetrical Bar Graph of Lines',
								'Bar Graph of Rectangles', 'Filled Bar Graph of Rectangles'];

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
	loopCheckbox.position(450, 528);

	// for the user-inputted files
	input = createFileInput(handleFile);
	input.position(5, 532);

	// use this to display time vs full time
	textSize(32);

	fill(0);
	timeDisplay = text(0, 700, 700);
	fill(hu, 255, 255);

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
	updateVolumeSlider();

	// this draws the visualization the user has chosen
	drawAccordingToMode(mode, spectrum, amplitudeLevel);

	// update timeline to reflect current time
	updateTimeline();
	// loop the sound file
	if (timeline.value() >= 0.999 && loopCheckbox.checked()) {
		jumpAudioToTime(0);
	}

	// show the current time compared to the full time
	// timeInSeconds = Math.round(audio.currentTime()).toString();
	// timeDisplay.style('text', timeInSeconds);

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

// for using the volume slider
function updateVolumeSlider() {
	audio.setVolume(slider.value());
}

// to toggle looping
function loopToggled() {
	audio.setLoop(loopCheckbox.checked());
}

// used for updating the timeline based on user input
function updateTimeline() {
	if (audio.isLoaded()) {
		if(audio.currentTime() === 0) {
			timeline.value(previousTime);
		} else {
			timeline.value(map(audio.currentTime(), 0, audio.duration(), 0, 1));
		}
		previousTime = timeline.value();
	}


}

function timelineChanged() {
	if (audio.isLoaded()) {
		jumpAudioToTime(map(timeline.value(), 0, 1, 0, audio.duration()));
	}
}

function jumpAudioToTime(timeValue) {
	if (timeValue > 0 || timeValue < audio.duration()) {
		stopAudio();
		audio.play(0, 1, slider.value(), timeValue);
	} else {
		print("invalid time value");
	}
}

// for when a file is inputted
// also add a text box that says the name of the file
function handleFile(file) {
	print(file.name);
	if (file.type === 'audio') {
		stopAudio();
		audio = loadSound(file.data);
		playing = false;
		// reset the timeline to reflect the new duration
		timeline.remove();
		calibrateTimeline();
	} else {
		print("This file is not the correct format");
	}
}

// this is called when a key is pressed
function keyTyped() {
	if (key === ' ') {
		// play/pause
		toggle();
	} else if (key === 'm') {
		toggleMute();
	} else if (key === 'l') {
		// toggle looping
		loopCheckbox.checked(!loopCheckbox.checked());
		loopToggled();
	}
}

// deal with arrow keys and sliders
function keyPressed() {
	if (keyCode === LEFT_ARROW) {
		var timeValue = map(timeline.value(), 0, 1, 0, audio.duration()) - 5;
		if (timeValue < 0) {
			jumpAudioToTime(0);
		} else {
  		jumpAudioToTime(timeValue);
		}
	}
	if (keyCode === RIGHT_ARROW) {
		var timeValue = map(timeline.value(), 0, 1, 0, audio.duration()) + 5;
		if (timeValue > audio.duration()) {
			jumpAudioToTime(audio.duration()-0.1);
		} else {
  		jumpAudioToTime(timeValue);
		}
	}
	if (keyCode === UP_ARROW) {
		var volValue = slider.value() + 0.1;
  	slider.value(volValue);
	}
	if (keyCode === DOWN_ARROW) {
		var volValue = slider.value() - 0.1;
  	slider.value(volValue);
	}
}

// this is called when the mouse is pressed
function mousePressed() {
	if (mouseY > 55 && mouseY < height && mouseX < width) {
		toggle();
	} else if (mouseX < width && mouseY > height && mouseY < height + 30) {
		masterVolume(0);
	}
}

// this is called when the mouse is released
function mouseReleased() {
	if (mouseX < width + 50 && mouseY > height - 50) {
		masterVolume(1);
	}
}

function calibrateTimeline() {
	timeline = createSlider(0, 1, 0, 0.01);
	timeline.style('width', '505px');
	timeline.position(0, 512);
	timeline.input(timelineChanged);
	previousTime = 0;
}

function toggleMute() {
	if (masterVolume().value == 1) {
		masterVolume(0);
	} else if (masterVolume().value == 0) {
		masterVolume(1);
	}
}

function toggleMuteWithValue(value) {
	if (value == 0 || value == 1) {

	} else {
		print("invalid volume value");
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
			barGraphSymmetricalLinesDraw(spectrum);
			return;
		case 16:
			barGraphRectDraw(spectrum, 2);
			return;
		case 17:
			barGraphRectDraw(spectrum, 0);
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

function barGraphSymmetricalLinesDraw(spectrum) {
	var w = width / spectrum.length;

	for (var i = 0; i < spectrum.length; i++) {
		var amp = spectrum[i];
		var y1 = map(amp, 0, 256, height/2, height * 0.75);
		var y2 = map(amp, 0, 256, height/2, height * 0.25);

		line(i*w, height/2, i*w, y1);
		line(i*w, height/2, i*w, y2);
	}
}
