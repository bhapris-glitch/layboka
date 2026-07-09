// layboka/apps/api/src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },

    role: {
      type: String,
      enum: ["merchant", "admin", "super_admin"],
      default: "merchant",
      index: true
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    avatar: {
      type: String,
      default: ""
    },

    phone: {
      type: String,
      default: ""
    },

    timezone: {
      type: String,
      default: "UTC"
    },

    lastLoginAt: {
      type: Date
    },

    lastLoginIp: {
      type: String
    },

    loginCount: {
      type: Number,
      default: 0
    },

    failedLoginAttempts: {
      type: Number,
      default: 0
    },

    passwordChangedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/**
 * Hash password before saving
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

/**
 * Compare password
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Remove sensitive fields
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();

  delete user.password;

  return user;
};

/**
 * Update login information
 */
userSchema.methods.updateLogin = async function (ipAddress) {
  this.lastLoginAt = new Date();
  this.lastLoginIp = ipAddress;
  this.loginCount += 1;
  this.failedLoginAttempts = 0;

  await this.save();
};

const User = mongoose.model("User", userSchema);

export default User;
