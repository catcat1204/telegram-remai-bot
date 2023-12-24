const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    botId: String,
    tksDatas: Object,
    tkcDatas: Object,
    tksUpdateAt: Date,
    tkcUpdateAt: Date,
  },
  { timestamps: true }
);
module.exports = mongoose.model("bot", schema);
