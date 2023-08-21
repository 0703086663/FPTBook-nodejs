const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
const mongooseDelete = require("mongoose-delete");

const Schema = mongoose.Schema;

const Book = new Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "Author" },

    title: { type: String, minLength: 1, maxLength: 255 },
    price: { type: Number, minLength: 1, default: 0 },
    image: { type: String, minLength: 1 },
    available: { type: Boolean, default: true },
    slug: { type: String, slug: "title", unique: true },
    deletedAt: {},
  },
  {
    timestamps: true,
  }
);

Book.plugin(mongooseDelete, {
  overrideMethods: "all",
  deletedAt: true,
});
mongoose.plugin(slug);

module.exports = mongoose.model("Book", Book);
