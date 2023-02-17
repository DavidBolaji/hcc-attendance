// Middleware function to get a single attendance record by ID
async function getAttendance(req, res, next) {
    try {
      const attendance = await Attendance.findById(req.params.id);
      if (!attendance) {
        return res.status(404).json({ message: 'Attendance record not found' });
      }
      res.attendance = attendance;
      next();
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  module.exports =  getAttendance;