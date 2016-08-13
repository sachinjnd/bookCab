var APPCAB = {};
var logs = [];
logs.unshift("Hello", "Lol", "Hehe");

var FormModel = React.createClass({
	render: function() {
		return(
			<div>
				<h4 className="mybox-heading">It's time to book an Uber</h4>
				<input type="text" className="form-control" id="source" placeholder="Source (latitude, longitude)" />
				<input type="text" className="form-control" id="dest" placeholder="Destination (latitude, longitude)" />
				<input type="time" className="form-control" id="time" placeholder="Time" />
				<input type="text" className="form-control" id="email" placeholder="Email" />
				<button className="btn btn-md btn-primary btn-block">REMIND ME</button>
				<div style={{marginTop: '10px'}} className="alert alert-success success" id="success" hidden>Reminder set successfully.</div>
			</div>
		);
	}
});


var LogModel = React.createClass({
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


ReactDOM.render(
	<FormModel />,
	document.getElementById('form-model')
);

ReactDOM.render(
	<LogModel />,
	document.getElementById('log-model')
);