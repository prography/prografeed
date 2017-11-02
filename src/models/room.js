let mongoose = require('mongoose')
let Schema = mongoose.Schema

let roomSchema = new Schema({
  ppt: {
    type: String
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
  created_at: {type: Date, default: Date.now}
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
}

roomSchema.loadClass(Room)

module.exports = mongoose.model('room', roomSchema)
