const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
const mongooseDelete = require("mongoose-delete");

const Schema = mongoose.Schema;

const User = new Schema(
  {
    name: { type: String, minLength: 1, maxLength: 255 },
    email: { type: String, minLength: 1, maxLength: 255 },
    password: { type: String },
    role: { type: String, default: "Member" },
    address: { type: String, minLength: 1, maxLength: 255 },
    gender: { type: Boolean, minLength: 1, maxLength: 255 },
    avatar: { type: String, maxLength: 255 },
    countFailed: { type: Number, default: 0 },
    deletedAt: {},
  },
  {
    timestamps: true,
  }
);

User.plugin(mongooseDelete, {
  overrideMethods: "all",
  deletedAt: true,
});
mongoose.plugin(slug);

module.exports = mongoose.model("User", User);
