control = {	
	circle_length: 5000,
	
	socket: null,
	callback: null,
	
	started: false,
	
	state: {
		camera: false,
		drive: false
	},
	
	photo_count: null,
	photo_current: null,
	photo_list: [],

	init: function() {
		this.connectSocket();
	},
	
	connectSocket: function() {
		var self = this;
		
		const addr = window.location.href.replace(/\/$/g, ":8080/");
		
		var s = document.createElement("script");
		s.src = addr + "socket.io/socket.io.js";
		document.getElementsByTagName("head")[0].appendChild(s);
		
		setTimeout(function() {
			self.socket = io.connect(addr);
			self.initSocket();
			self.testDevices();
		}, 100);
	},
	
	initSocket: function() {
		var self = this;
		
		this.socket.on("message", function(msg) {			
			if (typeof self.callback == 'function') {
				self.callback(msg);
				//self.callback = null;
			}
		});
	},
	
	testDevices: function() {
		var self = this;
		
		this.sendMessage({"command": "drive_state"}, function(msg) {			
			self.state.drive = msg.state;
			
			self.sendMessage({"command": "camera_state"}, function(msg) {
				self.state.camera = msg.state;
				self.updatePage();
				
				if (self.state.camera != "connected" || self.state.drive != "connected") {
					setTimeout(function() {
						self.testDevices();
					}, 2000);
				}
			});
		});
	},
	
	updatePage: function() {		
		if (this.state.drive == "connected") {
			$(".device.device-arduino").addClass("connected");
		} else {
			$(".device.device-arduino").removeClass("connected");
		}
		
		if (this.state.camera == "connected") {
			$(".device.device-camera").addClass("connected");
		} else {
			$(".device.device-camera").removeClass("connected");
		}
		
		if (this.state.drive == "connected" && this.state.camera == "connected") {
			$(".session-config .start").removeAttr("disabled");
		} else {
			$(".session-config .start").attr("disabled", "disabled");
		}
	},
	
	ready: function() {
		return this.state.drive == "connected" && this.state.camera == "connected";
	},
	
	sendMessage: function(msg, callback) {
		if (null == this.socket) {
			return false;
		}
		
		this.callback = callback || null;
		this.socket.send(msg);
	},
	
	start: function() {
		if (this.ready() == false || this.started == true) {
			alert("Устройства не готовы");
			return false;
		}
		
		this.photo_list = [];
		this.started = true;
		this.photo_count = $(".session-config #input-photo-count").val();
		this.photo_current = 0;
		
		$(".session-config .progress")
			.attr('max', this.photo_count)
			.val(this.photo_current);
		
		$(".session-config #input-photo-count").attr("disabled", "disabled");
		$(".session-config .start").text("Остановить");
		
		this.takePhoto();
	},
	
	pause: function() {
		
	},
	
	finish: function() {
		$.ajax({
			type: 'POST',
			url: './archive.php',
			data: {
				files: this.photo_list
			},
			success: function(response) {
				if (typeof response.success != 'undefined' && response.success == true) {
					document.location.href = "." + response.file;
				}
			}
		});
		
		this.started = false;
		
		$(".session-config .start").text("Начать");
		$(".session-config #input-photo-count").removeAttr("disabled");
		
		return false;
	},
	
	takePhoto: function() {
		var self = this;
		
		if (self.photo_count == self.photo_current) {
			return self.finish();
		}
		
		this.sendMessage({"command": "make_photo"}, function(msg) {
			if (msg.success == true) {
				self.photo_current++;
				self.photo_list.push(msg.path);
				
				self.updateProgress();
				self.movePlatform();
			} else {
				self.pause();
			}
		});
	},
	
	getDistance: function() {
		return Math.round(this.circle_length / this.photo_count);
	},
	
	updateProgress: function() {
		$(".session-config .progress").val(this.photo_current);
	},
	
	movePlatform: function() {
		var self = this;
		
		this.sendMessage({"command": "move", distance: this.getDistance()}, function(msg) {
			if (msg.success == true) {
				self.takePhoto();
			}
		});
	}
}

window.control = control;