const asyncHandler = require('../utils/asyncHandler')
const User = require('../models/userModel')
const { ApiError } = require('../utils/ApiError')
const { ApiResponse } = require('../utils/ApiResponse')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sendMail = require('../utils/sendMail')

// register user
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, email, address, city, state, password } =
    req.body

  if (
    !firstName ||
    !lastName ||
    !phone ||
    !email ||
    !address ||
    !city ||
    !state ||
    !password
  ) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, '', 'All fields are mandatory'))
  }

  const oldUser = await User.findOne({ email })
  if (oldUser) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, '', 'User already exists'))
  }

  const hashPassword = await bcrypt.hash(password, 10)
  const newUser = await User.create({ ...req.body, password: hashPassword })
  const token = jwt.sign({ _id: newUser._id }, process.env.JWT_PRIVATEKEY, {
    expiresIn: '5d',
  })

  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  })

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: newUser, token },
        '',
        'Registered successfully!'
      )
    )
})

// login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res
      .status(400)
      .send(new ApiResponse(400, {}, '', 'All fields are mandatory'))
  }

  const user = await User.findOne({ email })
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ _id: user._id }, process.env.JWT_PRIVATEKEY, {
      expiresIn: '5d',
    })

    res.cookie('token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    })

    res
      .status(200)
      .json(new ApiResponse(200, { user, token }, '', 'Login successful!'))
  } else {
    res
      .status(500)
      .json(new ApiResponse(500, {}, '', 'Email or Password is invalid'))
  }
})

//log out user

const logoutUser = asyncHandler(async (req, res) => {
  const { token } = req.cookies
  if (!token) {
    return res.status(400).send(new ApiResponse(404, {}, 'Please login'))
  }
  res.cookie('token', null, { httpOnly: true, expires: new Date(Date.now()) })
  res.status(200).json(new ApiResponse(200, {}, 'Log out successfully!'))
})

//forgot password

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({ message: 'Please enter email' })
  }

  const user = await User.findOne({ email })

  if (!user) {
    return res.status(404).json({ message: 'User does not exist' })
  }

  const resetToken = user.getResetPasswordToken()

  await user.save({ validateBeforeSave: false })

  const resetURL = `${req.protocol}://${5173}/password/reset/${resetToken}`
  const subject = 'Password Reset Request'
  const message = `Dear ${user.firstName},\n\nWe received a request to reset your password. You can reset your password by clicking the link below:\n\n${resetURL}\n\nIf you did not request a password reset, please disregard this email.\n\nThank you,\nSahaya`

  try {
    await sendMail({ email, subject, message })
    res.status(200).json({ message: 'Email sent successfully!' })
  } catch (e) {
    console.log(e)
    user.resetPasswordExpire = undefined
    user.resetPasswordToken = undefined
    await user.save({ validateBeforeSave: false })
    res.status(400).json({ message: 'Failed to send mail' })
  }
})

// update user profile

const updateUserProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ message: 'update user' })
})

const resetPassword = asyncHandler(async (req, res) => {
  const resetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')
  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpire: { $gt: Date.now() },
  })
  if (!user) {
    return res
      .status(404)
      .send({ message: 'Reset password token has been expired or not valid' })
  }
  const { password } = req.body
  const hashPassword = await bcrypt.hash(password, 10)
  user.password = hashPassword
  user.resetPasswordToken = undefined
  user.resetPasswordToken = undefined
  await user.save()
  res.status(200).send({ message: 'Successfully changed the password' })
})

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
  if (!users) {
    return res.status(404).send({ message: 'No user Found' })
  }
  res.status(200).send(users)
})

const getUser = asyncHandler(async (req, res) => {
  const id = req.params.id
  const user = await User.findById(id)
  if (!user) {
    return res.status(404).send({ message: 'User not found' })
  }
  res.status(200).send(user)
})

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { ...req.body },
    {
      new: true,
    }
  )
  res.status(200).send({ message: 'Successfully updated profile' })
})

const trackUserLocation = asyncHandler(async (req, res) => {
  try {
    const { latitude, longitude } = req.body

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ message: 'Latitude and longitude are required' })
    }

    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.locations.push({
      type: 'Point',
      coordinates: [longitude, latitude],
    })

    await user.save()

    res.status(200).json({
      message: 'Location updated successfully',
      latestLocation: user.locations[user.locations.length - 1],
    })
  } catch (error) {
    console.error('Error updating location:', error)
    res.status(500).json({ message: 'Server error' })
  }
})
module.exports = {
  registerUser,
  loginUser,
  updateUserProfile,
  logoutUser,
  forgotPassword,
  resetPassword,
  getAllUsers,
  updateProfile,
  trackUserLocation,
}
