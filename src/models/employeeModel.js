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
    },
    gender: {
      type: String,
    },
    nbusStop: {
      type: String,
    },
    addressGroup: {
      type: String,
    },
    email: {
      type: String,
      // required: [true, "A user must have an email"],
      default: "Nil",
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
    qr: { type: String, default: "https://hcc.com" },
    DOB: {
      type: String,
    },
    month: {
      type: String,
    },
    occupation: {
      type: String,
    },
    role: {
      type: ["member", "worker", "Admin"],
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
    strictPopulate: false,
  }
);

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
      user.err = "Unable to login";
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.err = "Wrong email or password";
    }

    if (user.role[0] !== "Admin") {
      user.err = "Unauthorized";
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
