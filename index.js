var fs = require('fs');
var sp = require('serialport');
var socket = require('socket.io');
var gphoto2 = require('gphoto2');
var io = require('socket.io').listen(8080); 

var STATE 			= 0,
	PORT 			= null,
	CAMERA 			= null,
	ARDUINO_STATE 	= 0;

var checkSerialDev = function() {
	var tty = 'ttyUSB';
	
	for (var i = 0; i < 9; i++) {
		var port = '/dev/' + tty + i;
		
		if (fs.existsSync(port)) {
			return port;
		}
	}
	
	return null;
}

var updateState = function() {
	if (STATE == 0 || STATE == 2) {
		var dev = checkSerialDev();
		if (null !== dev) {
			initPort(dev);
		}
	}
	
	setTimeout(function() {
		updateState();
	}, 1000);
}

var initPort = function(dev) {
	PORT = new sp(dev, {
		baudrate: 9600,
		autoOpen: false
	});
	
	PORT.readyCallback = null;
	
	PORT.open(function(err) {
		if (err) {
			console.log(err);
		}
	});

	PORT.on('open', function() {
		console.log('Arduino connected');
		STATE = 1;
	});

	PORT.on('data', function(data) {
		if (data == "r") {
			console.log("Arduino ready");
			ARDUINO_STATE = 1;
			
			if (typeof this.readyCallback == 'function') {
				this.readyCallback();
				this.readyCallback = null;
			}
		}
	});
	
	PORT.on('disconnect', function() {
		console.log('Arduino disconnected');
		STATE = 2;
	});
	
	PORT.moveDrive = function(distance, callback) {
		this.write("m" + distance);
		ARDUINO_STATE = 2;
		this.readyCallback = callback || null;
	}
}

io.sockets.on('connection', function (socket) {
	socket.on("message", function(msg) {
		if (typeof msg.command == 'undefined') {
			return;
		}
		
		// Get arduino connection status
		if (msg.command == "drive_state" && null !== PORT) {
			socket.json.send({
				state: STATE == 1 ? "connected": "disconnected",
				status: ARDUINO_STATE == 1 ? "ready" : "busy"
			});
		}
		
		// Move drive
		if (msg.command == "move" && null !== PORT && typeof msg.distance != 'undefined') {
			PORT.moveDrive(msg.distance, function() {
				socket.json.send({
					success: true
				});
			});
		}

		// Get photo camera state
		if (msg.command == "camera_state") {
			gphoto2.connected(function(state) {
				socket.json.send({
					"state": state == true ? "connected": "disconnected"
				});
			});
		}
		
		// Make photo from camera
		if (msg.command == "make_photo") {
			gphoto2.takePhoto(function(obj) {
				socket.json.send({
					success: true,
					path: obj.path
				});
			},
			function(e) {
				socket.json.send({
					success: false
				});
			}
		);
		}
	});
});

// Start monitoring serial port
updateState();
