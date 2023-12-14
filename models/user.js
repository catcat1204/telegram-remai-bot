const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    chatId: String,
    className: String,
    time: String,
    enable: Boolean,
  },
  { timestamps: true }
);
module.exports = mongoose.model("user", schema);
