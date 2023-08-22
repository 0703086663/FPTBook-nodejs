const User = require("../models/User");
const Author = require("../models/Author");
const Book = require("../models/Book");
const Bill = require("../models/Bill");

const {
  multipleMongooseToObject,
  mongooseToObject,
} = require("../utils/mongoose");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class HomeController {
  async index(req, res, next) {
    try {
      const books = await Book.find().populate("author");
      const authors = await Author.find();

      return res.render("index", {
        title: "Home",
        user: mongooseToObject(req.user),
        books: multipleMongooseToObject(books),
        authors: multipleMongooseToObject(authors),
      });
    } catch (err) {
      next(err);
    }
  }

  about(req, res, next) {
    return res.render("home/about", {
      title: "About",
      description: "Information about FPT Book",
      user: mongooseToObject(req.user),
    });
  }

  register(req, res, next) {
    if (req.user) {
      return res.redirect("/");
    } else
      res.render("home/register", {
        title: "Register",
        noHeader: true,
        user: mongooseToObject(req.user),
      });
  }

  store(req, res, next) {
    User.findOne({ email: req.body.email })
      .then((data) => {
        if (data != null) {
          req.flash("error", "Email already registered!");
          return res.redirect("back");
        } else {
          var temp = req.body.password;
          bcrypt.hash(temp, 10, function (err, hash) {
            const user = new User({
              role: "Member",
              password: hash,
              email: req.body.email,
              name: req.body.firstname + " " + req.body.lastname,
              address: req.body.address,
              avatar: req.body.avatar,
            });
            user
              .save()
              .then((result) => {
                return res.redirect("/login");
              })
              .catch((err) => {
                console.error("Error: " + err);
                req.flash("error", "There was an error when saving!");
                return res.redirect("back");
              });
          });
        }
      })
      .catch((err) => console.log(err));
  }

  login(req, res, next) {
    console.log(req.user);

    if (req.user) {
      return res.redirect("/");
    } else {
      return res.render("home/login", {
        title: "Login",
        noHeader: true,
        user: mongooseToObject(req.user),
      });
    }
  }

  async validate(req, res, next) {
    try {
      const username = req.body.username;
      const password = req.body.password;

      const user = await User.findOne({ email: username });

      if (!user) {
        req.flash("error", "Wrong username");
        return res.redirect("back");
      }

      if (user.countFailed === 10) {
        req.flash(
          "error",
          "Account is temporarily locked, please try again in 1 minute!"
        );
        return res.redirect("back");
      }

      if (user.countFailed === 6) {
        req.flash(
          "error",
          "Account has been permanently locked! Contact admin to reopen the account"
        );
        return res.redirect("back");
      }

      const result = await bcrypt.compare(password, user.password);

      if (result) {
        const token = jwt.sign({ _id: user._id }, "secretpasstoken", {});
        await User.updateOne({ email: username }, { $set: { countFailed: 0 } });
        res.cookie("token", token, { maxAge: 2147483647, httpOnly: true });
        return res.redirect("/");
      }

      const failed = user.countFailed;

      if (failed === 2) {
        await User.updateOne(
          { email: username },
          { $set: { countFailed: 10 } }
        );

        const lockAccountOneMinute = setTimeout(async () => {
          await User.updateOne(
            { email: username },
            { $set: { countFailed: 3 } }
          );
        }, 60000);

        req.flash(
          "error",
          "Account has been locked for 1 minute! If you continue to enter incorrectly 3 more times, you will be locked forever!"
        );
        return res.redirect("back");
      } else if (failed >= 5) {
        await User.updateOne({ email: username }, { $set: { countFailed: 6 } });
        req.flash(
          "error",
          "Account has been permanently locked! Contact admin to reopen the account"
        );
        return res.redirect("back");
      } else {
        await User.updateOne(
          { email: username },
          { $set: { countFailed: failed + 1 } }
        );
        req.flash("error", "You have entered the wrong password!");
        return res.redirect("back");
      }
    } catch (error) {
      console.error("Error: " + error);
      req.flash("error", "Error occurred while validating!");
      return res.redirect("back");
    }
  }

  async bookDetail(req, res, next) {
    try {
      const book = await Book.findOne({ _id: req.params.id }).populate(
        "author"
      );

      if (!book) {
        return res.status(404).send("Book not found");
      }

      return res.render("book/detail", {
        title: "Detail",
        user: mongooseToObject(req.user),
        book: mongooseToObject(book),
      });
    } catch (err) {
      next(err);
    }
  }

  logout(req, res, next) {
    res.clearCookie("token");
    req.flash("success", "Logout completed!");
    return res.redirect("/login");
  }
}

module.exports = new HomeController();

const res = require("express/lib/response");
const homeController = require("./homeController");
