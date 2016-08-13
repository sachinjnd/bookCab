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
	request({url: 'https://api.uber.com/v1/estimates/time', qs: post_data}, function(error, response, body) {
		//console.log(response);
		if(!error && response.statusCode == 200) {
			//res.send(response);
			var data = JSON.parse(body);
			var estimate = null;
			for(product of data.times) {
				if(product.display_name == config.UBER_PRODUCT_NAME) {
					estimate = product.estimate;
					break;
				}
			}
			res.json({'code': 200, 'time': estimate});
		} else {
			res.json({'code': response.statusCode});
		}
	});
});

module.exports = router;
