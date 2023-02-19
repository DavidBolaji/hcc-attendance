const Attendance = require("../models/attendanceModel");
const Employee = require("../models/employeeModel");

exports.register = async (req, res) => {
  try {
    const user = new Employee({ ...req.body });
    await user.save();
    console.log(user)
    const token = await user.genAuthToken();

    await user.save();

    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send({message: e});
  }
};

exports.login = async (req, res) => {
  try {
    const user = await Employee.validateUser(req.body.email, req.body.password);
    const token = await user.genAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send({ e: "Unable to login" });
  }
};

exports.logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return req.token !== token.token;
    });

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


// exports.getUserAll = async (req, res) => { 
//     console.log('enter') 
//     try {
//         const usersWithAttendance = await Employee.find();
//         await usersWithAttendance.populate('attendance'); // populate the attendance.employee reference with the name of the employee
  
//       res.status(200).send(usersWithAttendance);
//     } catch (error) {
//       res.status(400).send({ error: "User not found" });
//     }
//   };


exports.getUserAll = async (req, res) => { 
    try {
        const users = await Employee.find({}, '-password -tokens');
        const attendance = await Attendance.find();
        const usersWithAttendance = users.map((user) => {
          const userAttendance = attendance.filter((att) => att.employeeId.toString() === user._id.toString());
          return {
            ...user.toObject(),
            attendance: userAttendance,
          };
        });

        res.status(200).send(usersWithAttendance);

    } catch (e) {
        res.status(400).send({ error: "User not found" });
    }

    // Map attendance to employee
  };

exports.getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await Employee.findById(id);

    if (!user) {
      throw new Error();
    }

    res.status(200).send(user);
  } catch (error) {
    res.status(400).send({ error: "User not found" });
  }
};

exports.update = async (req, res) => {
  try {
    const user = await Employee.find({ _id: req.user._id });

    const userObjs = Object.keys(req.body);

    const allowedArr = ["name", "img", "password", "tags", "description"];
    const isValid = userObjs.every((userObj) => allowedArr.includes(userObj));

    // console.log(user);

    if (!isValid) {
      res.status(400).send({ error: "Invalid Updates" });
    }

      const deleteRes = await cloudinary.uploader.destroy(
        `tec-client/user/${user[0]._id}`
      );

      console.log(deleteRes);

      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        public_id: user[0]._id,
        folder: "tec-client/user",
        format: "png",
        transformation: [
          {
            width: 300,
            height: 200,
            crop: "fill",
            gravity: "face",
          },
        ],
      });

      console.log(uploadRes);

      const newValueOj = {
        ...req.body,
      };

      userObjs.forEach((userObj) => {
        if (userObj === "tags") {
          let newTag;
          newTag = req.body[userObj].split(",");
          user[0][userObj] = newTag;
        } else {
          user[0][userObj] = newValueOj[userObj];
        }
      });

      user[0]["img"] = uploadRes.secure_url;

      await user[0].save();

      return res.status(200).send(user);

  } catch (e) {
    res.status(400).send(e);
  }
};

