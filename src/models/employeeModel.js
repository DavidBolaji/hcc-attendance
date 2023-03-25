const mongoose = require("../db/mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoosePaginate = require("mongoose-paginate-v2");

// Define the employee schema
const employeeSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
      // trim: true,
    },
    gender: {
      type: String,
    },
    nbusStop: {
      type: String,
      // trim: true,
    },
    addressGroup: {
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
      // trim: true,
    },
    qr: { type: String, default: "https://hcc.com" },
    DOB: {
      type: String,
    },
    month: {
      type: String,
      // trim: true,
    },
    occupation: {
      type: String,
      trim: true,
    },
    role: {
      type: ["member", "worker", "Admin"],
    },
  },
  {
    timestamps: true,
    strictPopulate: false,
  }
);

employeeSchema.methods.genAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET);
  // console.log(user.tokens);
  // user.tokens.push({ token });
  // console.log(user.tokens);
  // await user.save();
  return token;
};

employeeSchema.statics.validateUser = async (email, password) => {
  const user = await Employee.findOne({ email });

  if (!user) {
    return "Wrong email or password";
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return "Wrong email or password";
  }

  if (user.role[0] !== "Admin") {
    return "Unauthorized";
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

employeeSchema.virtual("attendances", {
  ref: "Attendance",
  localField: "_id",
  foreignField: "employeeId",
});

employeeSchema.plugin(mongoosePaginate);

// Define the models
const Employee = mongoose.model("Employee", employeeSchema);

// Export the models
module.exports = Employee;
