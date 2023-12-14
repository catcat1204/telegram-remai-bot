const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    botId: String,
    datas: [Object],
  },
  { timestamps: true }
);
module.exports = mongoose.model("bot", schema);
