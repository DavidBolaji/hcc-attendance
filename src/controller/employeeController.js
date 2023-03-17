const Attendance = require("../models/attendanceModel");
const Employee = require("../models/employeeModel");

exports.register = async (req, res) => {
  try {
    const user = new Employee({ ...req.body });
    const newUser = await user.save();
    const QRuser = await Employee.findByIdAndUpdate(newUser._id, {qr: process.env.FRONT_END_URL+'/'+newUser._id},{new:true})
    const token = await QRuser.genAuthToken();

    await QRuser.save();

    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send({message: e});
  }
};

exports.login = async (req, res) => {
  
 
  try {
    const user = await Employee.validateUser(req.body.email, req.body.password);
    if(user.err) {
      console.log(user.err)
      return res.status(400).send({ e: user.err });
    }
    const token = await user.genAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send({ e: user.err });
  }
};

exports.logout = async (req, res) => {

  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return req.token !== token.token;
    });

    console.log(req.user.tokens)

    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
};

exports.logoutAll = async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
};


// GET /users
// Retrieve all users
// Example: /users?page=1&limit=10&sort=name&search=John
exports.getUsers = async (req, res) => {
  const { page = 1, limit = 10, sort = 'createdAt', search = '' } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { [sort]: 1 },
    collation: {
      locale: 'en',
    },
  };

  const query = {
    $or: [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ],
  };

  try {
    const users = await Employee.paginate(query, options);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getUserAll = async (req, res) => { 
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort || 'createdAt';
  const direction = req.query.direction || 'desc';
  const filter = req.query.filter || '';
  const end = req.query.end || '';

  const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
     try {
      const startDate = new Date(filter);

      const endDate =  new Date(end);
        const totalCount = await Employee.find({}, '-password -tokens').count()
        const users = await Employee.find({}, '-password -tokens')
        .sort({ [sort]: direction })
        .limit(limit)
        .skip(startIndex)
        .exec()
        
        const attendance = await Attendance.find({createdAt: {$gte: startDate, $lt: endDate }});
        const usersWithAttendance = users.map((user) => {
          const userAttendance = attendance.filter((att) => att.employeeId.toString() === user._id.toString());
          return {
            ...user.toObject(),
            attendance: userAttendance,
          };
        })
        
        
        res.status(200).send({data: usersWithAttendance, totalCount });

    } catch (e) {
        res.status(400).send({ error: "User not found" });
    }
   
  };




// exports.getUserAll = async (req, res) => { 
//     try {
//         const users = await Employee.find({}, '-password -tokens');
//         const attendance = await Attendance.find();
//         const usersWithAttendance = users.map((user) => {
//           const userAttendance = attendance.filter((att) => att.employeeId.toString() === user._id.toString());
//           return {
//             ...user.toObject(),
//             attendance: userAttendance,
//           };
//         });

//         res.status(200).send(usersWithAttendance);

//     } catch (e) {
//         res.status(400).send({ error: "User not found" });
//     }

//     // Map attendance to employee
//   };

exports.getUserAll2 = async (req, res) => {
  try {
    const user = await Employee.find({});

    res.status(200).send(user);
  } catch (error) {
    res.status(400).send({ error: "User not found" });
  }
};


exports.getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await Employee.findById(id);

    if (!user) {
      throw new Error();
    }

    res.status(200).send(user)
  } catch (error) {
    res.status(400).send({ error: "User not found" });
  }
};

exports.update = async (req, res) => {
    const url = req.query.url;
    try {
      const user = await Employee.findOneAndUpdate({_id:req.query.url.split('=')[1] }, {qr: url},{new: true})
      return res.status(200).send(user);
  
    } catch (e) {
      res.status(400).send(e);
    }
  };

// exports.update = async (req, res) => {
//   try {
//     const user = await Employee.find({ _id: req.user._id });

//     const userObjs = Object.keys(req.body);

//     const allowedArr = ["name", "img", "password", "tags", "description"];
//     const isValid = userObjs.every((userObj) => allowedArr.includes(userObj));

//     // console.log(user);

//     if (!isValid) {
//       res.status(400).send({ error: "Invalid Updates" });
//     }



//       await user[0].save();

//       return res.status(200).send(user);

//   } catch (e) {
//     res.status(400).send(e);
//   }
// };

