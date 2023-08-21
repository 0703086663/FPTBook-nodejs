const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = {
  authenticateUser: async function (req, res, next) {
    const secret = "secretpasstoken";
    try {
      const token = req.cookies.token;
      req.isAuthenticated = false;
      if (token) {
        try {
          const decoded = jwt.verify(token, secret);
          await User.findOne({ _id: decoded }).then((user) => {
            req.user = user;
            req.isAuthenticated = true;
          });
          next();
        } catch (error) {
          req.flash("error", "You need to login first");
          return res.redirect("/login");
        }
      }
    } catch (error) {
      next();
    }
  },
};
