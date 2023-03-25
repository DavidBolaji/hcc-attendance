const jwt = require("jsonwebtoken");
const Employee = require("../models/employeeModel");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");

    const decoded = jwt.verify(token, process.env.SECRET);

    // console.log(token);
    // console.log(decoded._id);

    const user = await Employee.findOne({ _id: decoded._id });

    // console.log(user);

    // console.log(!user)

    if (!user) throw new Error();

    req.user = user;
    req.token = token;

    // console.log(req.token);
    next();
  } catch (e) {
    res.status(401).send({ error: "user not authenticated" });
  }
};

module.exports = auth;
