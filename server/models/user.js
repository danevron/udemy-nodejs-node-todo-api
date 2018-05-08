const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

let userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});


userSchema.methods.toJSON = function () {
  return _.pick(this.toObject(), ['_id', 'email']);
};

userSchema.statics.findByToken = function (token) {
  let decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  } catch (e) {
    return Promise.reject();
  }

  return this.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

userSchema.methods.generateAuthToken = function () {
  const access = 'auth';
  var token = jwt.sign({access, _id: this._id.toHexString()}, 'abc123').toString();

  this.tokens.push({access, token});

  return this.save().then(() => {
    return token;
  });
};

const User = mongoose.model('User', userSchema);

module.exports = { User };
