const User = require("../models/User");

class UserController {
  async updateUser(req, res, next) {
    try {
      const { name, address, role, avatar } = req.body;
      const userId = req.user._id;
      const user = await User.findById(userId);

      if (!user) {
        req.flash("error", "User not found");
        return res.redirect("/user/profile");
      }

      user.name = name;
      user.address = address;
      user.role = role;
      user.avatar = avatar;

      await user.save();

      req.flash("success", "Profile updated successfully");
      res.redirect("/user/profile");
    } catch (error) {
      console.error(error);
      req.flash("error", "Failed to update profile");
      res.redirect("/user/profile");
    }
  }

  profile(req, res, next) {
    return res.render("profile", {
      title: "Profile",
      user: mongooseToObject(req.user),
    });
  }
}

module.exports = new UserController();

const res = require("express/lib/response");
const userController = require("./userController");
