const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const jobsHistorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 70,
    },
    description: {
      type: String,
      trim: true,
    },
    salary: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
    },
    interviwDate: {
      type: Date,
    },
    applicationStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: [true, "first name is required"],
      maxlength: 32,
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, "last name is required"],
      maxlength: 32,
    },
    email: {
      type: String,
      trim: true,
      required: [true, "e-mail name is required"],
      unique: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please add a valid email",
      ],
    },

    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["male", "femele", "other"],
    },
    dob: {
      type: Date,
    },

    relation: {
      type: Number,
      required: false,
    },

    monthlyFee: {
      type: String,
      required: false,
    },
    memberShipID: {
      type: String,
      required: [false, "MemberShipID is required"],
    },
    idType: {
      type: String,
      required: [true, "id Type name is required"],
    },

    idNumber: {
      type: String,
      required: [true, "id Number is required"],
    },
    address: {
      type: String,
      required: [true, "Adress is required"],
    },
    contact1: {
      type: String,
      required: [true, "Contact is required"],
    },
    contact2: {
      type: String,
    },
    partnerLocation: {
      type: String,
      required: false,
    },

    userType: {
      type: Number,
      required: [true, "User type is required"],
    },
    company: {
      type: ObjectId,
      ref: "Company",
      required: false,
    },
    plan: {
      type: ObjectId,
      ref: "Plan",
      required: false,
    },

    user: {
      type: ObjectId,
      ref: "User",
      required: true,
    },

    password: {
      type: String,
      trim: true,
      // required: [true, "password name is required"],
      
      default: "mediplus",
      // minlength: [6, "passwprd must have at least (6) caracters"],
    },
    // jobsHistory: [jobsHistorySchema],
    role: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

//encrypting password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

//compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//return a JWT token
userSchema.methods.getJwtToken = function () {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: 3600,
  });
  return token;
};

module.exports = mongoose.model("User", userSchema);
