const mongoose = require('../db/mongoose');
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// Define the employee schema
const employeeSchema = new mongoose.Schema({
    name: {
      type: String,
    },
    email: {
        type: String,
        required: [true, "A user must have an email"],
        trim: true,
        lowercase: true,
        unique: true,
        // validate(value) {
        //   if (!validator.isEmail(value)) {
        //     throw new Error("Please enter a valid email!");
        //   }
        // },
      },
    password: {
        type: String,
        required: true,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    tokens: [
        {
          token: {
            type: String,
            required: true,
          },
        },
      ],
    },
  {
    timestamps: true,
  });

  employeeSchema.methods.genAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
  };

  employeeSchema.statics.validateUser = async (email, password) => {
    const user = await Employee.findOne({ email });
  
    try {
      if (!user) {
        throw new Error("Unable to login");
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        throw new Error("Unable to login");
      }
    } catch (e) {
      return e;
    }
  
    return user;
  };
  
  employeeSchema.pre("save", async function (next) {
    const user = this;
  
    if (user.isModified("password")) {
      user.password = await bcrypt.hash(user.password, 8);
    }
  
    next();
  });
  
  employeeSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
  
    delete userObject.password;
    delete userObject.tokens;
  
    return userObject;
  };

  // Define the models
const Employee = mongoose.model('Employee', employeeSchema);

// Export the models
module.exports = Employee;