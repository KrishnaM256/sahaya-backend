const mongoose = require('mongoose')
const crypto = require('crypto')

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please enter first name'],
    },
    lastName: {
      type: String,
      required: [true, 'Please enter last name'],
    },
    phone: {
      type: String,
      required: [true, 'Please enter phone number'],
    },
    email: {
      type: String,
      required: [true, 'Please enter email'],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    address: {
      type: String,
      required: [true, 'Please enter address'],
    },
    city: {
      type: String,
      required: [true, 'Please enter city'],
    },
    state: {
      type: String,
      required: [true, 'Please enter state'],
    },
    emergencyContacts: [
      {
        phone: {
          type: String,
        },
        email: {
          type: String,
          match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email address',
          ],
        },
      },
    ],
    password: {
      type: String,
      required: [true, 'Please enter password'],
    },
    role: {
      type: String,
      default: 'user',
    },
    locations: [
      {
        type: {
          type: String,
          enum: ['Point'],
          required: true,
        },
        coordinates: {
          type: [Number],
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
)

userSchema.index({ locations: '2dsphere' })

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex')
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000
  return resetToken
}

module.exports = mongoose.model('User', userSchema)
