var config = require('../config');
var express = require('express');
var router = express.Router();
var request = require('request');


router.post('/estimateTime', function(req, res, next) {
	var latitude = req.body.latitude;
	var longitude = req.body.longitude;
	var post_data = {
		server_token: config.UBER_SERVER_TOKEN,
		start_latitude: latitude,
		start_longitude: longitude
	};

	console.log('Hitting Uber API');

	hitUberAPI(post_data, function(data) {
		res.json(data);
	});
});


function hitUberAPI(post_data, callback) {
	request({url: 'https://api.uber.com/v1/estimates/time', qs: post_data}, function(error, response, body) {
		//console.log(response);
		try {
			if(!error && response.statusCode == 200) {
				//res.send(response);
				var data = JSON.parse(body);
				var estimate = null;
				var size = data.times.length;
				var i;
				for(i=0; i<size; i++) {
					var product = data.times[i];
					if(product.display_name == config.UBER_PRODUCT_NAME) {
						estimate = product.estimate;
						break;
					}
				}
				callback({'code': 200, 'time': estimate});
			} else {
				callback({'code': response.statusCode});
			}
		} catch(err) {
			console.log(err + ': Hitting Maps API again');
			hitUberAPI(post_data, callback);
		}
	});
}



module.exports = router;
