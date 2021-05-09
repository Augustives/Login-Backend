require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const User = require("./login-model.js");

// Connect no Mongo
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connection with mongo open!!");
  })
  .catch((err) => {
    console.log("Error connecting to mongo!!");
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "react");
app.use(
  cors({
    origin: "http://localhost:3000", // <-- location of the react app were connecting to
    credentials: true,
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(cookieParser("process.env.SESSION_SECRET"));
app.use(passport.initialize());
app.use(passport.session());
require("./passport-config")(passport);

app.get("/", (req, res) => {
  res.send("API Funcionando");
});

app.get("/user", (req, res) => {
  res.send(req.user);
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) res.send("No User Exists");
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.send("Successfully Authenticated");
        console.log(req.user);
      });
    }
  })(req, res, next);
});

app.post("/register", async (req, res) => {
  User.findOne({ username: req.body.username }, async (err, doc) => {
    const { username, password, email } = req.body;
    if (err) throw err;
    if (doc) res.send("User Already Exists");
    if (!doc) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username: username,
        password: hashedPassword,
        email: email,
      });
      await newUser.save();
      res.send("User Created");
    }
  });
});

app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});

app.listen(process.env.PORT, () => {
  console.log(`Online at port: ${process.env.PORT}`);
});

// const register = () => {
//   Axios({
//     method: "POST",
//     data: {
//       username: registerUsername,
//       password: registerPassword,
//     },
//     withCredentials: true,
//     url: "",
//   }).then((res) => console.log(res));
// };
// const login = () => {
//   Axios({
//     method: "POST",
//     data: {
//       username: loginUsername,
//       password: loginPassword,
//     },
//     withCredentials: true,
//     url: "",
//   }).then((res) => console.log(res));
// };
// const getUser = () => {
//   Axios({
//     method: "GET",
//     withCredentials: true,
//     url: "",
//   }).then((res) => {
//     setData(res.data);
//     console.log(res.data);
//   });
// };
