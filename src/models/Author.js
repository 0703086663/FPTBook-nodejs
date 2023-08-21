const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const slug = require("mongoose-slug-generator");

const Schema = mongoose.Schema;

const Author = new Schema(
  {
    name: { type: String, minLength: 1, maxLength: 255 },
    deletedAt: {},
  },
  {
    timestamps: true,
  }
);

Author.plugin(mongooseDelete, {
  overrideMethods: "all",
  deletedAt: true,
});
mongoose.plugin(slug);

module.exports = mongoose.model("Author", Author);
