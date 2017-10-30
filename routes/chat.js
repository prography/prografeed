var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	res.render('chat', {title: '프로그라피드백'});
});

module.exports = router;

