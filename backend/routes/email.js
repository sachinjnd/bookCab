var config = require('../config');
var express = require('express');
var router = express.Router();
var request = require('request');


router.post('/', function(req, res, next) {
	var email = req.body.email;
	sendMail(email, function(data) {
		res.json({code: data});
	});
});


function sendMail(email, callback) {
	request('https://sachingarg.space/bookCab/sendEmail.php?secret='+config.MY_SMTP_SECURE_KEY+'&email='+email, function (error, response, body) {
		if (!error) {
			callback(response.statusCode);
		}
	})
}


module.exports = router;
