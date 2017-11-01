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
  created_at: {type: Date, default: Date.now}
})

class User {
  getUserInfo () {
    return {
      name: this.nickname,
      created_at: this.created_at
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

  static confirmLogin (name, password) {
    return new Promise((resolve, reject) => {
      this.find({
        name
      }).exec((err, person) => {
        if (err) {
          reject(new Error({
            code: '03'
          }))
        }
        if (person.length === 0) {
          reject(new Error({
            code: '00' // 이름 없음
          }))
        } else {
          if (person.password.equals(password)) {
            resolve({
              code: '10' // 로그인 성공
            })
          } else {
            reject(new Error({
              code: '01' // 비밀번호 틀림
            }))
          }
        }
      })
    })
  }
}

userSchema.loadClass(User)

module.exports = mongoose.model('user', userSchema)
