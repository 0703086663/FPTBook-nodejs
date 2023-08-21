const User = require("../models/User");
const Author = require("../models/Author");
const Book = require("../models/Book");
const Bill = require("../models/Bill");

const {
  multipleMongooseToObject,
  mongooseToObject,
} = require("../utils/mongoose");

const { calculateCartTotal } = require("../utils/calculateCartTotal");

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

  async updateUser(req, res, next) {
    try {
      const { name, address, role, avatar } = req.body;
      const userId = req.user._id;
      const user = await User.findById(userId);

      if (!user) {
        req.flash("error", "User not found");
        return res.redirect("/profile");
      }

      user.name = name;
      user.address = address;
      user.role = role;
      user.avatar = avatar;

      await user.save();

      req.flash("success", "Profile updated successfully");
      res.redirect("/profile");
    } catch (error) {
      console.error(error);
      req.flash("error", "Failed to update profile");
      res.redirect("/profile");
    }
  }

  profile(req, res, next) {
    return res.render("profile", {
      title: "Profile",
      user: mongooseToObject(req.user),
    });
  }

  removeFromCart(req, res, next) {
    const bookId = req.params.id;
    const bookIndex = req.session.cart.indexOf(bookId);

    if (bookIndex !== -1) {
      req.session.cart.splice(bookIndex, 1);
    }

    res.redirect("/cart");
  }

  async cart(req, res, next) {
    const cartItemIds = req.session.cart || [];

    try {
      const cartItems = await Book.find({ _id: { $in: cartItemIds } }).exec();
      const cartTotal = await calculateCartTotal(cartItems); // Await here

      res.render("cart", {
        title: "Shopping Cart",
        user: mongooseToObject(req.user),
        cartItems: multipleMongooseToObject(cartItems),
        cartTotal,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }

  async addToCart(req, res, next) {
    try {
      const bookId = req.params.id;

      const book = await Book.findById(bookId);

      if (!book) {
        return res.status(404).send("Book not found");
      }

      if (!req.session.cart) {
        req.session.cart = [];
      }

      const isBookInCart = req.session.cart.some(
        (cartItem) => cartItem === bookId
      );

      if (!isBookInCart) {
        req.session.cart.push(bookId);
      }

      res.redirect("/cart");
    } catch (error) {
      next(error);
    }
  }

  async checkout(req, res, next) {
    try {
      const userId = req.user._id;
      const cartItemIds = req.session.cart || [];
      const books = await Book.find({ _id: { $in: cartItemIds } });

      const newBill = new Bill({
        user: userId,
        books: books,
        totalAmount: req.body.totalAmount,
      });

      await newBill.save();

      req.session.cart = [];
      req.flash("success", "Checkout successful!");
      res.redirect("back");
    } catch (error) {
      req.flash("error", "Checkout failed!");
      res.redirect("back");
    }
  }
}

module.exports = new HomeController();

const res = require("express/lib/response");
const homeController = require("./HomeController");
