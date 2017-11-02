let mongoose = require('mongoose')
let Schema = mongoose.Schema

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
  isAdmin: {type: Boolean, default: false}
})

class User {
  getUserInfo () {
    return {
      username: this.username,
      nickname: this.nickname,
      isAdmin: this.isAdmin
    }
  }

  static add (username, nickname, password) {
    return new Promise((resolve, reject) => {
      new this({
        username,
        nickname,
        password
      }).save((err, result) => {
        if (err) {
          let details = err.toJSON().errmsg
          if (details.indexOf('username') !== -1) {
            reject(new Error({
              code: '00'
            }))
          } else if (details.indexOf('nickname') !== -1) {
            reject(new Error({
              code: '01'
            }))
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
