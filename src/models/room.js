let mongoose = require('mongoose')
let Schema = mongoose.Schema

let roomSchema = new Schema({
  ppt: {
    type: String,
    unique: true
  },
  owner: {
    type: Schema.ObjectId,
    ref: 'user'
  },
  thumbnail: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

class Room {
  static add (ppt, owner) {
    return new Promise((resolve, reject) => {
      new this({
        ppt,
        owner
      }).save((err, result) => {
        if (err) {
          let error = new Error('디비 추가 오류')
          error.code = '01'
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }

  static async deleteRoomObject (ppt) {
    return new Promise((resolve, reject) => {
      this.remove({
        ppt
      }).exec((err, result) => {
        if (err) {
          let error = new Error('디비 삭제 오류')
          error.code = '01'
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }
}

roomSchema.loadClass(Room)

module.exports = mongoose.model('room', roomSchema)
