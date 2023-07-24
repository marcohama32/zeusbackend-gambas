const mongoose = require("mongoose");
const { startSession } = require("mongoose");
const { ObjectId } = mongoose.Schema;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const serviceBalanceSchema = new mongoose.Schema({
  service: {
    type: ObjectId,
    ref: "PlanService",
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
});


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
      enum: ["male", "female", "other"],
    },
    dob: {
      type: Date,
    },
    enrolmentDate: {
      type: Date,
    },

    relation: {
      type: String,
      required: false,
      enum: ["Main", "Wife", "Son", "Daughter", "Mother", "Father"],
    },

    monthlyFee: {
      type: String,
      required: false,
    },
    memberShipID: {
      type: String,
      unique: true,
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
      required: function () {
        return this.isNew; // Make it required only when creating a new document
      },
    },
    contact2: {
      type: String,
      required: false,
    },
    profile: {
      type: String,
      required: false,
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
    plan: [
      {
        type: ObjectId,
        ref: "Plan",
        required: false,
      },
    ],

    user: {
      type: ObjectId,
      ref: "User",
      required: false,
    },

    partnerUser: {
      type: ObjectId,
      ref: "Partner",
      required: false,
    },
    companyUser: {
      type: ObjectId,
      ref: "Company",
      required: false,
    },

    password: {
      type: String,
      trim: true,
      // required: [true, "password name is required"],

      default: "mediplus",
      // minlength: [6, "passwprd must have at least (6) caracters"],
    },
    balancePlan: {
      type: String,
      default: "0",
    },
    multipleFiles: {
      type: String,
    },
    avatar: {
      type: String,
    },
    myMembers: [
      {
        type: ObjectId,
        ref: "User",
        required: false,
      },
    ],
    role: {
      type: Number,
      default: 0,
    },
    availability: {
      type: String,
      required: false,
      enum: ["yes", "no"],
      default: "yes",
    },
    serviceBalances: [serviceBalanceSchema],
    manager: {
      type: ObjectId,
      ref: "User",
      required: false,
    },
    status: {
      type: String,
      default: "Active",
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
