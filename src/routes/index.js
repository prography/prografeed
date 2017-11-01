let express = require('express')
let router = express.Router()
let User = require('../models/user')

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index')
})

router.post('/', async (req, res, next) => {
  let nickname = req.body.nickname
  let pwd = req.body.pwd

  try {
    await User.confirmLogin(nickname, pwd)
    res.render('chat', {'nickname': nickname, 'pwd': pwd})
  } catch (err) {
    switch (err.code) {
      case '00':
        res.render('index', {err: 'true', errmsg: '닉네임이 존재하지 않습니다!'})
        break
      case '01':
        res.render('index', {err: 'true', errmsg: '비밀번호가 일치하지 않습니다!'})
        break
    }
  }
})

module.exports = router
