const mongoose = require("mongoose");

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

class AdminController {
  index(req, res, next) {
    return res.send("Index");
  }

  billManagement(req, res, next) {
    Bill.find()
      .populate("user")
      .populate("books")
      .sort({ createdAt: -1 })
      .then((bills) => {
        res.render("admin/billManagement", {
          title: "Bill Management",
          noHeader: true,
          user: mongooseToObject(req.user),
          bills: multipleMongooseToObject(bills),
        });
      })
      .catch(next);
  }

  bookManagement(req, res, next) {
    Promise.all([
      Book.find().sort({ updatedAt: -1 }).populate("author"),
      Author.find(),
    ])
      .then(([books, authors]) => {
        res.render("admin/bookManagement", {
          title: "Book Management",
          noHeader: true,
          user: mongooseToObject(req.user),
          books: multipleMongooseToObject(books),
          authors: multipleMongooseToObject(authors),
        });
      })
      .catch(next);
  }

  bookCreate(req, res, next) {
    try {
      Book.findOne({
        $and: [{ title: req.body.title }, { author: req.body.author }],
      }).then((book) => {
        if (book) {
          req.flash("error", "Book already exists!");
          return res.redirect("/admin/bookManagement");
        } else {
          const book = new Book({
            title: req.body.title,
            author: req.body.author,
            price: req.body.price,
            image: req.body.image,
            available: req.body.available ? true : false,
          });
          req.flash("success", "Book has been created!");
          book.save();
          return res.redirect("/admin/bookManagement");
        }
      });
    } catch (err) {
      req.flash("error", "There was an error when saving!");
      return res.redirect("back");
    }
  }

  bookUpdate(req, res, next) {
    const updatedAuthorId = req.body.author;

    Book.findOne({ _id: req.params.id })
      .then((book) => {
        if (!book) {
          req.flash("error", "Book not found!");
          return res.redirect("back");
        }

        book.author = mongoose.Types.ObjectId(updatedAuthorId);
        book.title = req.body.title;
        book.price = req.body.price;
        book.image = req.body.image;
        book.available = req.body.available ? true : false;

        book
          .save()
          .then((updatedBook) => {
            req.flash("success", "Book updated successfully!");
            return res.redirect("back");
          })
          .catch((err) => {
            req.flash("error", "Error updating the book!");
            return res.redirect("back");
          });
      })
      .catch(next);
  }

  bookDelete(req, res, next) {
    const bookId = req.params.id;

    Book.findByIdAndRemove(bookId)
      .then(() => {
        req.flash("success", "Book deleted successfully!");
        res.redirect("back");
      })
      .catch(next);
  }

  authorManagement(req, res, next) {
    Author.find().then((authors) => {
      res.render("admin/authorManagement", {
        title: "Author Management",
        noHeader: true,
        user: mongooseToObject(req.user),
        authors: multipleMongooseToObject(authors),
      });
    });
  }

  authorCreate(req, res, next) {
    try {
      Author.findOne({ name: req.body.name }).then((author) => {
        if (author) {
          req.flash("error", "Author already exists!");
        } else {
          const author = new Author(req.body);
          author.save();
          req.flash("success", "Author has been created!");
        }
        return res.redirect("back");
      });
    } catch (err) {
      req.flash("error", "There was an error when saving!");
      return res.redirect("back");
    }
  }

  authorUpdate(req, res, next) {
    Author.findOne({ _id: req.params.id })
      .then((author) => {
        if (author) {
          if (author.name === req.body.name) {
            req.flash("error", "Author name remains the same.");
            return res.redirect("back");
          } else {
            Author.findOne({ name: req.body.name })
              .then((existingAuthor) => {
                if (existingAuthor) {
                  req.flash("error", "Author with this name already exists.");
                  return res.redirect("back");
                } else {
                  Author.updateOne(
                    { _id: req.params.id },
                    { name: req.body.name }
                  )
                    .then(() => {
                      req.flash("success", "Author updated successfully!");
                      return res.redirect("back");
                    })
                    .catch(next);
                }
              })
              .catch(next);
          }
        } else {
          req.flash("error", "Author not found!");
          return res.redirect("back");
        }
      })
      .catch(next);
  }

  authorDelete(req, res, next) {
    const authorId = req.params.id;

    Author.findByIdAndRemove(authorId)
      .then(() => {
        req.flash("success", "Author deleted successfully!");
        res.redirect("back");
      })
      .catch(next);
  }
}

module.exports = new AdminController();

const res = require("express/lib/response");
const adminController = require("./adminController");
