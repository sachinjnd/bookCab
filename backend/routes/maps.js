var config = require('../config');
var express = require('express');
var router = express.Router();
var request = require('request');


function placeToGoogleString(place) {
	return place.latitude + ',' + place.longitude;
}


router.post('/estimateTime', function(req, res, next) {
	var source = req.body.source;
	var dest = req.body.dest;
	var post_data = {
		key: config.MAPS_API_KEY,
		units: 'metric',
		origins: placeToGoogleString(source),
		destinations: placeToGoogleString(dest)
	};

	console.log('Hitting Maps API');
	request({url: 'https://maps.googleapis.com/maps/api/distancematrix/json', qs: post_data}, function(error, response, body) {
		//console.log(response);
		if(!error && response.statusCode == 200) {
			//res.send(response);
			var data = JSON.parse(body);
			var estimate = data.rows[0].elements[0].duration.value;
			res.json({'code': 200, 'time': estimate});
		} else {
			res.json({'code': response.statusCode});
		}
	});
});

module.exports = router;
