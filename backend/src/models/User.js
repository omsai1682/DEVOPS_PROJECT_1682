const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getPostgresUrl } = require('../config/postgres');
const { PgUser } = require('./pgAdapter');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    role: {
      type: String,
      enum: ['admin', 'customer', 'inventory_manager'],
      default: 'customer'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

// Dynamic dual-driver export (Neon PostgreSQL or MongoDB)
module.exports = new Proxy(MongooseUser, {
  get(target, prop) {
    if (getPostgresUrl() && prop in PgUser) {
      return PgUser[prop];
    }
    return target[prop];
  },
  apply(target, thisArg, argumentsList) {
    return Reflect.apply(target, thisArg, argumentsList);
  },
  construct(target, argumentsList) {
    if (getPostgresUrl()) {
      return new PgUser(...argumentsList);
    }
    return new target(...argumentsList);
  }
});
