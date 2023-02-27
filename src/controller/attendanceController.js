const Attendance = require("../models/attendanceModel");

exports.create = async (req, res) => {
    try {
      const attendance = new Attendance(req.body);
      const savedAttendance = await attendance.save();
      res.json(savedAttendance);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  exports.read = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'createdAt';
    const direction = req.query.direction || 'desc';
    const filter = req.query.filter || '';
    const end = req.query.end || '';
  
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
  
    const results = {};

  
    try {
      if (filter) {
        const startDate = new Date(filter);

        const endDate =  new Date(end);

        results.totalCount = await Attendance.countDocuments({
            createdAt: {$gte: startDate, $lt: endDate }
        });
        results.data = await Attendance.find({  createdAt: {$gte: startDate, $lt: endDate } })
          .sort({ [sort]: direction })
          .limit(limit)
          .skip(startIndex)
          .populate('employeeId')
          .exec();
      } else {
        results.totalCount = await Attendance.countDocuments({});
        results.data = await Attendance.find({})
          .sort({ [sort]: direction })
          .limit(limit)
          .skip(startIndex)
          .populate('employeeId')
          .exec();
      }
  
      if (endIndex < results.totalCount) {
        results.next = {
          page: page + 1,
          limit: limit,
          sort: sort,
          direction: direction,
          filter: filter
        };
      }
  
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit,
          sort: sort,
          direction: direction,
          filter: filter
        };
      }
  
      res.status(200).json(results);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  };

  exports.getAttendanceUser = async (req,res) => {
        try {
            const usersWithAttendance = await Attendance.find({createdAt});
            await usersWithAttendance.populate('attendance'); // populate the attendance.employee reference with the name of the employee
      
          res.status(200).send(usersWithAttendance);
        } catch (error) {
          res.status(400).send({ error: "User not found" });
        }
  }

  exports.single = async (req, res) => {
    res.json(res.attendance);
  };

  exports.update = async (req, res) => {
    try {
      Object.assign(res.attendance, req.body);
      const updatedAttendance = await res.attendance.save();
      res.json(updatedAttendance);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  exports.delete = async (req, res) => {
    try {
      await res.attendance.remove();
      res.json({ message: 'Attendance record deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }