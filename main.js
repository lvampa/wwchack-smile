'use strict';

const digitalAccelerometer = require('jsupm_mma7660');
const upmBuzzer            = require("jsupm_buzzer");// Initialize on GPIO 5
const myBuzzer             = new upmBuzzer.Buzzer(5);
const http                 = require('http');


// Instantiate an MMA7660 on I2C bus 0
const myDigitalAccelerometer = new digitalAccelerometer.MMA7660(
					digitalAccelerometer.MMA7660_I2C_BUS,
					digitalAccelerometer.MMA7660_DEFAULT_I2C_ADDR);

// place device in standby mode so we can write registers
myDigitalAccelerometer.setModeStandby();

// enable 64 samples per second
myDigitalAccelerometer.setSampleRate(digitalAccelerometer.MMA7660.AUTOSLEEP_64);

// place device into active mode
myDigitalAccelerometer.setModeActive();

var x, y, z;
x = digitalAccelerometer.new_intp();
y = digitalAccelerometer.new_intp();
z = digitalAccelerometer.new_intp();

//const ax, ay, az;
//ax = digitalAccelerometer.new_floatp();
//ay = digitalAccelerometer.new_floatp();
//az = digitalAccelerometer.new_floatp();

//const outputStr;
var prev = [];
var current = [];
const diff = 2;

//const myInterval = setInterval(function()
//{
//	myDigitalAccelerometer.getRawValues(x, y, z);
//    var changed = false;
//
//    // set defaults if not exist
//    if (typeof prev[y] === 'undefined') {
//        prev[y] = digitalAccelerometer.intp_value(y);
//        prev[z] = digitalAccelerometer.intp_value(z);
//        prev[x] = digitalAccelerometer.intp_value(x);
//    }
//
//    current[y] = digitalAccelerometer.intp_value(y)
//    current[z] = digitalAccelerometer.intp_value(z)
//    current[x] = digitalAccelerometer.intp_value(x)
//
//    if (Math.abs(prev[x] - current[x]) > diff) {
//        console.log(`X has changed from ${prev[x]} to ${current[x]}`);
//        changed = true;
//    }
//
//    if (Math.abs(prev[y] - current[y]) > diff) {
//        console.log(`Y has changed from ${prev[y]} to ${current[y]}`);
//        changed = true;
//    }
//
//    if (Math.abs(prev[z] - current[z]) > diff) {
//        console.log(`Z has changed from ${prev[z]} to ${current[z]}`);
//        changed = true;
//    }
//
//    prev[y] = current[y];
//    prev[z] = current[z];
//    prev[x] = current[x];
//
//    if (changed) {
//        console.log("Send request")
//        melody();
//    }
//
////	myDigitalAccelerometer.getAcceleration(ax, ay, az);
////	outputStr = "Acceleration: x = "
////		+ roundNum(digitalAccelerometer.floatp_value(ax), 6)
////		+ "g y = " + roundNum(digitalAccelerometer.floatp_value(ay), 6)
////		+ "g z = " + roundNum(digitalAccelerometer.floatp_value(az), 6) + "g";
////	console.log(outputStr);
//}, 250);


(function checkTilt() {
	myDigitalAccelerometer.getRawValues(x, y, z);
    var changed = false;

    // set defaults if not exist
    if (typeof prev[y] === 'undefined') {
        prev[y] = digitalAccelerometer.intp_value(y);
        prev[z] = digitalAccelerometer.intp_value(z);
        prev[x] = digitalAccelerometer.intp_value(x);
    }

    current[y] = digitalAccelerometer.intp_value(y)
    current[z] = digitalAccelerometer.intp_value(z)
    current[x] = digitalAccelerometer.intp_value(x)

    if (Math.abs(prev[x] - current[x]) > diff) {
        console.log(`X has changed from ${prev[x]} to ${current[x]}`);
        changed = true;
    }

    if (Math.abs(prev[y] - current[y]) > diff) {
        console.log(`Y has changed from ${prev[y]} to ${current[y]}`);
        changed = true;
    }

    if (Math.abs(prev[z] - current[z]) > diff) {
        console.log(`Z has changed from ${prev[z]} to ${current[z]}`);
        changed = true;
    }

    prev[y] = current[y];
    prev[z] = current[z];
    prev[x] = current[x];

    if (changed) {
        smiley();
        melody();
        setTimeout(function() {
            frown();
            checkTilt();
        }, 5000);    
        
    } else {
        setTimeout(function() {
            checkTilt();
        }, 250);    
    }
    
})();

function smiley() {
    http.get("http://10.232.205.239/on", function(response) {
        // do nothing
    })
}

function frown() {
    http.get("http://10.232.205.239/off", function(response) {
        // do nothing
    })
}


myBuzzer.setVolume(0.01);

var chords = [];
chords.push(upmBuzzer.MI);
chords.push(upmBuzzer.RE);
chords.push(upmBuzzer.MI);
chords.push(upmBuzzer.RE);
chords.push(upmBuzzer.MI);
chords.push(upmBuzzer.SI);
chords.push(upmBuzzer.RE);
chords.push(upmBuzzer.LA);


// chords here to make a melody!
//chords.push(upmBuzzer.DO);
//chords.push(upmBuzzer.RE);
//chords.push(upmBuzzer.MI);
//chords.push(upmBuzzer.FA);
//chords.push(upmBuzzer.SOL);
//chords.push(upmBuzzer.LA);
//chords.push(upmBuzzer.SI);
//chords.push(upmBuzzer.DO);
//chords.push(upmBuzzer.SI);


function melody()
{
    for (const chord of chords) {
        console.log( myBuzzer.playSound(chord, 400000) );
    };
    
    myBuzzer.stopSound();
}
//setInterval(melody, 100);


// When exiting: clear interval and print message
process.on('SIGINT', function()
{
	clearInterval(myInterval);

	// clean up memory
	digitalAccelerometer.delete_intp(x);
	digitalAccelerometer.delete_intp(y);
	digitalAccelerometer.delete_intp(z);

	digitalAccelerometer.delete_floatp(ax);
	digitalAccelerometer.delete_floatp(ay);
	digitalAccelerometer.delete_floatp(az);

	myDigitalAccelerometer.setModeStandby();
    
    myBuzzer.stopSound();
	console.log("Exiting...");
	process.exit(0);
});
