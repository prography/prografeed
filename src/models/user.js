let mongoose = require('mongoose')
let Schema = mongoose.Schema
var nameList = require('../routes/list_config.json')

let userSchema = new Schema({
  username: {
    type: String,
    unique: true
  },
  nickname: {
    type: String,
    unique: true
  },
  password: String,
  created_at: {type: Date, default: Date.now},
  isAdmin: {type: Boolean, default: false},
  balloon: {type: Number, default: 50000},
  recBalloon: {type: Number, default: 0},
  
})

class User {
  getUserInfo () {
    return {
      username: this.username,
      nickname: this.nickname,
      isAdmin: this.isAdmin
    }
  }

  static async getPersonObject (nickname) {
    return new Promise((resolve, reject) => {
      this.find({
        nickname
      }).exec((err, person) => {
        if (err) {
          let error = new Error('디비 조회 오류')
          error.code = '01'
          reject(error)
        } else {
          resolve(person[0])
        }
      })
    })
  }

  static getBalloonNum (nickname) {
    this.find({
      nickname
    }).exec((err, person) => {
      if (err) {
      } else {
        return person[0]['recBalloon']
      }
    })
  }


  static async sendBalloon (sender, receiver, balloonNum) {
    var arr = []
    var senderTeamArr = []
    var receiverTeamArr = []
    for (var key in nameList) arr.push(nameList[key]["name"])
    if (nameList[arr.indexOf(sender.username).toString()]["team"]) {
      for (var key in nameList[arr.indexOf(sender.username).toString()]["team"]) {
        senderTeamArr.push(nameList[arr.indexOf(sender.username).toString()]["team"][key])
      }
    } if (nameList[arr.indexOf(receiver.username).toString()]["team"]) {
      for (var key in nameList[arr.indexOf(receiver.username).toString()]["team"]) {
        receiverTeamArr.push(nameList[arr.indexOf(receiver.username).toString()]["team"][key])
      }
    } 

    var sameTeam = false
    for (var i = 0; i < senderTeamArr.length; i++) {
      if (receiverTeamArr.indexOf(senderTeamArr[i]) != -1) sameTeam = true
    }

    return new Promise((resolve, reject) => {
      if (sender.balloon < balloonNum) {
        let error = new Error('별풍 갯수 부족')
        error.code = '00'
        reject(error)
      } else if (sameTeam) {
        let error = new Error('같은 팀에게 별풍 쏠 수 없음')
        error.code = '05'
        reject(error)
      } else {this.update({
        nickname: sender.nickname
      }, {$set: {balloon: sender.balloon - balloonNum}
      }).exec((err, result) => {
        if (err) {
          let error = new Error('별풍 전송 에러')
          error.code = '03'
          reject(error)
        } else {
          this.update({
            nickname: receiver.nickname
          }, {$set: {recBalloon: receiver.recBalloon + Number(balloonNum)}
          }).exec((err, result) => {
            if (err) {
              let error = new Error('별풍 전송 에러')
              error.code = '04'
              reject(error)
            } else {
              resolve({remained: sender.balloon - Number(balloonNum), received: receiver.recBalloon + Number(balloonNum)})
            }
          })
        }
      })}
    })
  }

  static async add (username, nickname, password) {
    return new Promise((resolve, reject) => {
      new this({
        username,
        nickname,
        password,
      }).save((err, result) => {
        if (err) {
          let details = err.toJSON().errmsg
          if (details.indexOf('username') !== -1) {
            let error = new Error()
            error.code = '00'
            reject(error)
          } else if (details.indexOf('nickname') !== -1) {
            let error = new Error()
            error.code = '01'
            reject(error)
          }
        }
        resolve(result)
      })
    })
  }

  static async confirmLogin (nickname, password) {
    return new Promise((resolve, reject) => {
      this.find({
        nickname
      }).exec((err, person) => {
        if (err) {
          let error = new Error('디비 조회 오류')
          error.code = '03'
          reject(error)
        }
        if (person.length === 0) {
          let error = new Error('닉네임 없음')
          error.code = '00'
          reject(error)
        } else {
          if (person[0].password === password) {
            resolve(person[0])
          } else {
            let error = new Error('비밀번호 틀림')
            error.code = '01'
            reject(error)
          }
        }
      })
    })
  }
}

userSchema.loadClass(User)

module.exports = mongoose.model('user', userSchema)
