const Book = require("../models/Book");
const Bill = require("../models/Bill");

const { calculateCartTotal } = require("../utils/calculateCartTotal");

class CartController {
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

module.exports = new CartController();

const res = require("express/lib/response");
const cartController = require("./cartController");
