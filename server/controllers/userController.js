const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { jwtAuthMiddleware, generateToken } = require("../middlewares/jwtMiddleware");

module.exports.login = async (req, res, next) => {
  try {
    res.setHeader('Access-Control-Allow-Credentials', true);
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Username or Password", status: false });

    delete user.password;
    const token = generateToken({ id: user._id , username: user.username, email: user.email, isAvatarImageSet: user.isAvatarImageSet});
    if (token){
      console.log("Token generated successfully");
      console.log(token);
      res.cookie("jwt", token);
      // res.setHeader("Authorization", `Bearer ${token}`);
    }
    else{
      console.log("Token generation failed");
    }
    return res.json({ status: true, user });
    //sending full user information to frontend except password
  } catch (ex) {
    next(ex);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    delete user.password;
    console.log(user);
    const token = generateToken({ id: user._id , username: user.username, email: user.email, isAvatarImageSet: user.isAvatarImageSet});
    if (token){
      console.log("Token generated successfully");
      res.cookie('jwt', token);
      // res.setHeader("Authorization", `Bearer ${token}`);
      // console.log(token);
    }
    else{
      console.log("Token generation failed");
    }
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    //give details of all users excluding the id send from frontend
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.logOut = (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};
