var domainUrl = 'http://localhost:3000/';
var maxGoogleDeviation = 60 * 60;	// in seconds
var maxUberETA = 15 * 60;			// in seconds
var safeInterval = 60;				// in seconds (extra offset time for booking cab and API call time)
var APPCAB = {};
var logs = [];
var tasks = [];
logs.unshift('[' + amPm(new Date()) + '] - Welcome :)');


var FormModel = React.createClass({
	getInitialState: function() {
		//return {source: '12.927880, 77.627600', dest: '13.035542, 77.597100', time: '23:50', email: 'xyz@gmail.com', enabled: true};
		return {source: '', dest: '', time: '', email: '', enabled: true};
	},
	handleSourceChange: function(e) {
		this.setState({source: e.target.value});
	},
	handleDestChange: function(e) {
		this.setState({dest: e.target.value});
	},
	handleTimeChange: function(e) {
		this.setState({time: e.target.value});
	},
	handleEmailChange: function(e) {
		this.setState({email: e.target.value});
	},
	handleRemindMe: function(e) {
		if(! this.state.enabled) {
			return;
		}

		this.setState({enabled: false});

		if(!this.state.source || !this.state.dest || !this.state.time || !this.state.email) {
			$("#error").show();
			setTimeout(function() { $("#error").hide(); }, 2000);
			this.setState({enabled: true});
			return;
		}

		if(!checkInputs(this.state.source, this.state.dest, this.state.time, this.state.email)) {
			$("#error").show();
			setTimeout(function() { $("#error").hide(); }, 2000);
			this.setState({enabled: true});
			return;
		}

		var task = new Task(this.state.source, this.state.dest, this.state.time, this.state.email);
		//tasks.push(task);
		addLog("Task added for " + this.state.email);
		getTravelTime(task);
		$("#success").show();
		setTimeout(function() { $("#success").hide(); }, 2000);
		this.setState({source: '', dest: '', time: '', email: '', enabled: true});
		//this.setState({source: '12.927880, 77.627600', dest: '13.035542, 77.597100', time: '23:50', email: 'xyz@gmail.com', enabled: true});
	},
	render: function() {
		return(
			<div>
				<h4 className="mybox-heading">It's time to book an Uber</h4>
				<input type="text" className="form-control" id="source" placeholder="Latitude, Longitude (Source)" value={this.state.source} onChange={this.handleSourceChange} />
				<input type="text" className="form-control" id="dest" placeholder="Latitude, Longitude (Destination)" value={this.state.dest} onChange={this.handleDestChange} />
				<input type="time" className="form-control" id="time" placeholder="Time" value={this.state.time} onChange={this.handleTimeChange} />
				<input type="text" className="form-control" id="email" placeholder="Email" value={this.state.email} onChange={this.handleEmailChange} />
				<button className="btn btn-md btn-primary btn-block" onClick={this.handleRemindMe}>REMIND ME</button>
				<div style={{marginTop: '10px'}} className="alert alert-success success" id="success" hidden>Task added successfully.</div>
				<div style={{marginTop: '10px'}} className="alert alert-warning error" id="error" hidden>Please enter valid inputs.</div>
			</div>
		);
	}
});


var LogModel = React.createClass({
	componentDidMount: function() {
		$(APPCAB).on('log', function(e) {
			this.forceUpdate();
		}.bind(this));
	},
	componentWillUnmount: function() {
		$(APPCAB).off('log');
	},
	render: function() {
		var logNodes = logs.map(function(log, i) {
			return(
				<div key={i}>{log}</div>
			);
		}.bind(this));
		return(
			<div>
				{logNodes}
			</div>
		);
	}
});


function Task(source, dest, time, email) {
	source = source.replace(/ /g,'');
	dest = dest.replace(/ /g,'');
	this.source = {};
	this.dest = {};
	this.source.lat = source.split(",")[0];
	this.source.long = source.split(",")[1];
	this.dest.lat = dest.split(",")[0];
	this.dest.long = dest.split(",")[1];
	this.time = new Date();
	this.time.setHours(time.substring(0,2), time.slice(-2));
	this.email = email.replace(/ /g,'');
	this.maxTravelTime = 0;
}


function checkInputs(source, dest, time, email) {
	source = source.replace(/ /g,'');
	dest = dest.replace(/ /g,'');
	if(!checkFloat(source.split(",")[0]) || !checkFloat(source.split(",")[1]) || !checkFloat(dest.split(",")[0]) || !checkFloat(dest.split(",")[0])) {
		return false;
	} else if(!checkEmail(email)) {
		return false;
	} else {
		return true;
	}
}


function checkFloat(value) {
	if(!isNaN(value) && value.toString().indexOf('.') != -1) {
		return true;
	} else {
		return false;
	}
}


function checkEmail(email) {
	var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	if (filter.test(email)) {
		return true;
	} else {
		return false;
	}
}


function getTravelTime(task) {
	addLog("Requested Google Maps API for [" + task.email + "]");
	var postData = { source: task.source, dest: task.dest };
	postToServer('maps/estimateTime', postData, function(data) {
		if(data == 'error') {
			addLog("ERROR in Maps API for [" + task.email + "]");
			// Retrying after 5 seconds
			setTimeout(function() { getTravelTime(task); }, 5000);
			return;
		}

		if(data.code != 200) {
			addLog("ERROR " + data.code + " from Maps API for [" + task.email + "]");
			// Retrying after 5 seconds
			setTimeout(function() { getTravelTime(task); }, 5000);
			return;
		}

		if(data.time == null) {
			addLog("NULL from Maps API for [" + task.email + "]");
			// Retrying after 5 seconds
			setTimeout(function() { getTravelTime(task); }, 5000);
			return;
		}

		// setting maxTravelTime when 0 initially and then updating maxTravelTime
		if(data.time + maxGoogleDeviation < task.maxTravelTime || task.maxTravelTime == 0) {
			task.maxTravelTime = data.time + maxGoogleDeviation;
		}

		var now = new Date();
		var timeDiff = timeDiffInSeconds(task.time, now);
		//addLog(timeDiff);

		if(timeDiff <= task.maxTravelTime + maxUberETA) {
			addLog("Requested Uber API for [" + task.email + "]");
			getUberTime(task, function(uberData) {
				if(uberData == 'error' || uberData == null) {
					// Retrying after 5 seconds
					setTimeout(function() { getTravelTime(task); }, 5000);
				} else {
					if(timeDiff <= data.time + uberData + safeInterval) {
						addLog("Sending email to [" + task.email + "]");
						sendEmail(task);
					} else {
						// check after one minute if current time is within max travel + uber time
						setTimeout(function() { getTravelTime(task); }, 60000);
					}
				}
			}.bind(this));
		} else {
			var interval = timeDiff - task.maxTravelTime - maxUberETA;
			// check after interval if current time outside max travel + uber time
			setTimeout(function() { getTravelTime(task); }, interval*1000);
		}

	});
}


function getUberTime(task, callback) {
	var postData = { latitude: task.source.lat, longitude: task.source.long };
	postToServer('uber/estimateTime', postData, function(data) {
		if(data == 'error') {
			addLog("ERROR in Uber API for [" + task.email + "]. Retrying in 5 seconds...");
			// Retrying after 5 seconds
			setTimeout(function() { getUberTime(task, callback); }, 5000);
			return;
		}

		if(data.code != 200) {
			addLog("ERROR " + data.code + " from Uber API for [" + task.email + "]. Retrying in 5 seconds...");
			// Retrying after 5 seconds
			setTimeout(function() { getUberTime(task, callback); }, 5000);
			return;
		}

		if(data.time == null) {
			addLog("NULL from Uber API for [" + task.email + "]. Retrying in 5 seconds...");
			// Retrying after 5 seconds
			setTimeout(function() { getUberTime(task, callback); }, 5000);
			return;
		} else {
			return callback(data.time);
		}
	});
}


function sendEmail(task) {
	var postData = { email: task.email };
	postToServer('email', postData, function(data) {
		if(data == 'error') {
			addLog("ERROR in sending email to " + task.email);
			//sendEmail(task);
			return;
		}
	});
}


function postToServer(url, data, callback) {
	$.ajax({
		url: domainUrl + url,
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(data),
		cache: false,
		success: function(rawData) {
			return callback(rawData);
		},
		error: function(xhr, status, err) {
			return callback("error");
		}
	});
}


function timeDiffInSeconds(time1, time2) {
	var diff = time1.getTime() - time2.getTime();
	return Math.round(diff/1000);
}


function addLog(text) {
	logs.unshift('[' + amPm(new Date()) + '] - ' + text);
	$(APPCAB).trigger('log');
}


function amPm(time) {
	var ampm = time.getHours() >= 12 ? 'PM' : 'AM';
	var hour = time.getHours() % 12 || 12;
	hour = ('0'+hour).slice(-2);
	var min = ('0'+time.getMinutes()).slice(-2);
	return hour + ':' + min + ' ' + ampm;
}


ReactDOM.render(
	<FormModel />,
	document.getElementById('form-model')
);

ReactDOM.render(
	<LogModel />,
	document.getElementById('log-model')
);