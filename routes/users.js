const mongoose = require('mongoose');
// const { use } = require('passport');

const plm = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost/twitter' , { useNewUrlParser: true , useUnifiedTopology: true});

const userSchema = mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  tweet:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tweet'
  }]
});

userSchema.plugin(plm);

module.exports = mongoose.model('user', userSchema);