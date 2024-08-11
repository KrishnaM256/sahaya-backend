const router = require('express').Router()
const {
  registerUser,
  loginUser,
  updateUserProfile,
  logoutUser,
  forgotPassword,
  resetPassword,
  getAllUsers,
  updateProfile,
} = require('../controller/userController')

router.route('/registerUser').post(registerUser)
router.route('/loginUser').post(loginUser)
router.route('/logoutUser').post(logoutUser)
router.route('/forgotPassword').post(forgotPassword)
router.route('/resetPassword/:token').post(resetPassword)
router.route('/getAllUsers').post(getAllUsers)
router.route('/updateProfile').post(updateProfile)
router.route('/updateUserProfile').post(updateUserProfile)

module.exports = router
