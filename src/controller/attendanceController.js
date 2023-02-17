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

    console.log(filter)
  
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
  
    const results = {};
  
    try {
      if (filter) {
        const startDate = new Date(filter);
        startDate.setHours(0);
        startDate.setMinutes(0);
        startDate.setSeconds(0);
        startDate.setMilliseconds(0);

        const endDate =  new Date(filter);
        endDate.setDate(endDate.getDate() + 1);
        
        results.totalCount = await Attendance.countDocuments({
            createdAt: {$gte: startDate, $lt: endDate }
        });
        results.data = await Attendance.find({  createdAt: {$gte: startDate, $lt: endDate } })
          .sort({ [sort]: direction })
          .limit(limit)
          .skip(startIndex)
          .exec();
      } else {
        results.totalCount = await Attendance.countDocuments({});
        results.data = await Attendance.find({})
          .sort({ [sort]: direction })
          .limit(limit)
          .skip(startIndex)
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