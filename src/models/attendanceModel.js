const mongoose = require('../db/mongoose');

// Define the attendance schema
const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  isPresent: {
    type: Boolean,
    default: true
  },
},{
    timestamps:true,
    strictPopulate: false 
});

  // Define the models
  const Attendance = mongoose.model('Attendance', attendanceSchema);

  // Export the models
  module.exports = Attendance;
