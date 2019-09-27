const express = require('express');
const router = express.Router();

const User = require('../models/user-model');


const bcrypt = require('bcryptjs');
const bcryptSalt = 10;

router.get('/signup', (req, res, next) => {
  res.render('auth/signup');
})


// action="/register"
router.post('/register', (req, res, next) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userFullName = req.body.fullName;

  if(userEmail == '' || userPassword == '' || userFullName == ''){
    res.render('auth/signup');
    return;
  }

  User.findOne({ email: userEmail })
  .then(foundUser => {
    if(foundUser !==null){
      // here we will redirect to '/login' 
      res.redirect('/login');
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPassword = bcrypt.hashSync(userPassword, salt);

      User.create({
        email: userEmail,
        password: hashPassword,
        fullName: userFullName
      })
      .then(user => {
        // if all good, log in the user automatically
          req.session.currentUser = user;
          res.redirect("/private");
      })
      .catch( err => next(err)); //closing User.create()
  })
  .catch( err => next(err)); // closing User.findOne();
})

//////////////// LOGIN /////////////////////
router.get("/login", (req, res) => {
  res.render("auth/login");
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.render("auth/login", { errorMessage: "Both fields are required" });

    return;
  }

  User.findOne({email: email })
    .then(user => {
      console.log('this is ze user: ' + user)
      if (!user) {
        console.log('no user')
        return res.render("auth/login", {
          errorMessage: "Invalid credentials"
        });
      }
      if (bcrypt.compareSync(password, user.password)) {
        req.session.currentUser = user;
        res.redirect("/private");
      } else {
        res.render("auth/login", { errorMessage: "Invalid credentials" });
      }
    })
    .catch(err => {
      res.render("views/signup", { errorMessage: err._message });
    });
});


//////////////// LOGOUT /////////////////////

router.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) console.log(err);
    res.redirect("/");
  });
});



module.exports = router;
