const express = require('express');
const router = new express.Router();
const attandanceController = require('../controller/attendanceController');
const getAttendance = require('../middleware/attendance');

// await cloudinary.uploader.upload(str, {})
router.post('/attendance/create', attandanceController.create)
router.get('/attendance/find', attandanceController.read);
router.delete('/attendance/delete/:id', getAttendance, attandanceController.delete);
router.put('/attendance/update/:Id', getAttendance, attandanceController.update);
router.get('/attendance/find/:id', attandanceController.single);
// router.post('/api/v1/blog/login', userController.login, catchAsyncError)


module.exports = router;