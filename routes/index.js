var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

router.get('/register', function(req, res) {
  res.render('register');
});

router.post('/register', function(req, res) {
  var name = req.body.name;
  var nickname = req.body.nickname;
  var pwd = req.body.pwd;
  var pwdchk = req.body.pwdchk;

  if(pwd != pwdchk) {
  	res.render('register', { err: true, errmsg: '비밀번호를 확인해주세요!' });
  }
  else if(!name || !nickname || !pwd || !pwdchk) {
  	res.render('register', { err: true, errmsg: '내용을 모두 입력해주세요!' });
  }
  else {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/prography";

	var registerErr = false;
	var errmsg = "";

    MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var collection = db.collection("users");
	  var query = { nickname: nickname };
	  collection.find(query).toArray(function(err, result) {
	    if (err) throw err;
	    if(result.length != 0) {
		  registerErr = true;
		  console.log(registerErr);
		  errmsg = '이미 등록된 닉네임입니다!!';
	    }
	  });
	  db.close();
	});
    MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var collection = db.collection("users");
	  var query = { name: name };
	  collection.find(query).toArray(function(err, result) {
	    if (err) throw err;
	    if(result.length != 0) {
		  errmsg = "이미 가입한 이름입니다!";
		  db.close();
  	  	  res.render('register', { err: true, errmsg: errmsg });
	    }
		else {
	  	  var query = { nickname: nickname };
	  	  collection.find(query).toArray(function(err, result) {
	      if (err) throw err;
	      if(result.length != 0) {
		    errmsg = '이미 등록된 닉네임입니다!!';
		  	db.close();
  	  	  	res.render('register', { err: true, errmsg: errmsg });
	      }
		  else {
	    	var query = { name: name, nickname: nickname, pwd: pwd };
	  		collection.insert(query);
	  		db.close();
	  		res.redirect('/');
		  }
	    });

		}
	  });
    });
  }
});


router.post('/rooms', function(req, res, next) {
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
	  if (result.length == 0) {
		db.close();
		res.render('index', {err: 'true', errmsg: '닉네임이 존재하지 않습니다!'});	
	  }
	  else {
		var query = { nickname: nickname, pwd: pwd };
		collection.find(query).toArray(function(err, result) {
	  	if (err) throw err;
	  	if (result.length == 0) {
			db.close();
			res.render('index', {err: 'true', errmsg: '비밀번호가 일치하지 않습니다!'});	
	  	}
	  	else {
			var collection = db.collection("rooms");
			collection.find().sort({"created_at": 1}).toArray(function(err, result) {
			  if (err) throw err;
			  db.close();
		 	  res.render('rooms', {rooms: result, nickname: nickname});
			});
	  	}
		});
	  }
	});

  });

});

router.post('/chat', function(req, res) {
  var pptname = req.body.pptname;
  var nickname = req.body.nickname

  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://localhost:27017/prography";

  MongoClient.connect(url, function(err, db) {
	if (err) throw err;
	var collection = db.collection("rooms");
	var query = { ppt: pptname };
	collection.find(query).toArray(function(err, result) {
	  if (err) throw err;
      db.close();
      res.render('chat', {pptname: pptname, nickname: nickname, conversations: JSON.stringify(result[0]['conversations'])});
	});
  });
});

module.exports = router;
