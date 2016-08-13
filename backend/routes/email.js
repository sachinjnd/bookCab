var config = require('../config');
var express = require('express');
var router = express.Router();
var request = require('request');


router.post('/email', function(req, res, next) {
	var email = req.body.email;
	sendMail(email, function(data) {
		res.json({code: data});
	});
});


function sendMail(email, callback) {
	request('http://localhost/bookCab/sendEmail.php?email='+email, function (error, response, body) {
		if (!error) {
			callback(response.statusCode);
		}
	})
}


module.exports = router;
