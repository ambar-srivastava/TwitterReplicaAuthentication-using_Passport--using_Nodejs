const express = require('express');
const passport = require('passport');
const router = express.Router();
const userModel = require('./users');
const localStrategy = require('passport-local');
const tweetModel = require('./tweet');

passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index');
});

router.post('/register', function (req, res) {
  const newUSer = new userModel({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
  });
  userModel.register(newUSer, req.body.password)
    .then(function (userRegistered) {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/profile');
      });
    });
});

router.get('/login', function (req, res) {
  res.render('login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/'
}), function (req, res) { });


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/');
  }
}

router.get('/logout', function (req, res, next) {
  req.logOut();
  res.redirect('/');
})

router.get('/profile', isLoggedIn, function (req, res, next) {
  res.render('profile');
})

router.post('/posttweet', function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .populate('tweet')
    .then(function (foundUser) {
      tweetModel.create({ caption: req.body.caption, userId: foundUser._id })
        .then(function (createdTweet) {
          foundUser.tweet.push(createdTweet)
          foundUser.save()
            .then(function (savedData) {
              res.send(savedData)
            })
        })
    })
})

router.get('/like/:tweetid',isLoggedIn, function(req,res){
  userModel.findOne({username: req.session.passport.user})
  .then(function(foundUser){
    tweetModel.findOne({_id: req.params.tweetid})
    .then(function(foundTweet){
      if(foundTweet.likes.indexOf(foundUser._id) === -1){
        foundTweet.likes.push(foundUser._id);
      }
      else{
        let likeIndex
        foundTweet.likes.splice(likeIndex, 1);
      }
      foundTweet.save().then(function(savedTweet){
        res.send(savedTweet);
      })
    })
  })
})

router.get('/edit/:tweetid', isLoggedIn, function(req,res){
  userModel.findOne({username: req.session.passport.user})
  .then(function(foundUser){
    tweetModel.findOne({_id: req.params.tweetid})
    .then(function(foundTweet){
      if(foundTweet.userId.equals(foundUser._id)){
        res.send('Show page for update');
      }
      else{
        res.send('Not your tweet');
      }
    })
  })
})
module.exports = router;
