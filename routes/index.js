var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

router.post('/', function(req, res, next) {
  var nickname = req.body.nickname;
  var pwd = req.body.pwd;

  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://localhost:27017/prography";

  MongoClient.connect(url, function(err, db) {
	if (err) throw err;
	var collection = db.collection("users");
	var query = { nickname: nickname };
	collection.find(query).toArray(function(err, result) {
	  if (err) throw err;
	  if(result.length == 0) {
		db.close();
		res.render('index', {err: 'true', errmsg: '닉네임이 존재하지 않습니다!'});	
	  }
	  else {
		var query = { nickname: nickname, pwd: pwd };
		collection.find(query).toArray(function(err, result) {
	  	if (err) throw err;
	  	if(result.length == 0) {
			db.close();
			res.render('index', {err: 'true', errmsg: '비밀번호가 일치하지 않습니다!'});	
	  	}
	  	else {
  			res.render('chat', {'nickname': nickname, 'pwd': pwd});
	  	}
		});
	  }
	  db.close();
	});

  });

});



module.exports = router;
