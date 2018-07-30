var express = require('express')
var router = express.Router()
let User = require('../models/user')
var nameList = require('./list_config.json')

router.get('/', function (req, res) {
  res.render('register')
})

router.post('/', async function (req, res) {
  var arr = []
  for (var key in nameList) arr.push(nameList[key]['name'])
  const {name, nickname, pwd, pwdchk} = req.body
  if (pwd !== pwdchk) {
    res.render('register', {err: true, errmsg: '비밀번호를 확인해주세요!'})
  } else if (!name || !nickname || !pwd || !pwdchk) {
    res.render('register', {err: true, errmsg: '내용을 모두 입력해주세요!'})
  } else if (arr.indexOf(name) === -1) {
    res.render('register', {err: true, errmsg: '회원 실명으로 가입해주세요!'})
  } else {
    try {
      req.session.user = await User.add(name, nickname, pwd)
      res.redirect('/')
    } catch (err) {
      let errmsg = ''
      switch (err.code) {
        case '00':
          errmsg = '이미 가입한 이름입니다!'
          break
        case '01':
          errmsg = '이미 등록된 닉네임입니다!!'
          break
      }
      res.render('register', {err: true, errmsg: errmsg})
    }
  }
})

module.exports = router
