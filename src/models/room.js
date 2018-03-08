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
  conversations: [
    {userId: Schema.ObjectId, nickname: String, body: String, date: Date, default: []}
  ],
  created_at: {type: Date, default: Date.now},
  recBalloon: {type: Number, default: 0}
})

class Room {
  static add (ppt, owner) {
    return new Promise((resolve, reject) => {
      new this({
        ppt,
        owner
      }).save((err, result) => {
        if (err) {
          reject(new Error(err))
        }
        resolve(result)
      })
    })
  }
  static async getRoomObject (ppt) {
    return new Promise((resolve, reject) => {
      this.find({
        ppt
      }).exec((err, room) => {
        if (err) {
          let error = new Error('디비 조회 오류')
          error.code = '01'
          reject(error)
        } else {
          resolve(room[0])
        }
      })
    })
  }
  static async getRoomBalloon (room) {
    return new Promise((resolve, reject) => {
      resolve(room.recBalloon)
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

  static async sendBalloon (msg, room, balloonNum) {
    return new Promise((resolve, reject) => {
      this.update({
        ppt: room.ppt
      }, {$set: {recBalloon: room.recBalloon + Number(balloonNum)}
      }).exec((err, result) => {
        if (err) {
          let error = new Error('디비 업데이트 오류')
          error.code = '01'
          reject(error)
        } else {
          resolve(room.recBalloon + Number(balloonNum))
        }
      })
    })
  }
}

roomSchema.loadClass(Room)

module.exports = mongoose.model('room', roomSchema)
