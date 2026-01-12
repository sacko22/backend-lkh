const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  nomineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Nomine",
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  visitorId: {
    type: String,
    required: true
  }
}, { timestamps: true });


module.exports = mongoose.model("Vote", voteSchema);
