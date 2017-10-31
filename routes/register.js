var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('register');
});

router.post('/', function(req, res) {
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


module.exports = router;
