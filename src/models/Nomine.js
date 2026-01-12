const mongoose = require("mongoose");

const nomineSchema = new mongoose.Schema({
  nomComplet: {
    type: String,
    required: true
  },
  photo: {
    type: String
  },
  biographie: {
    type: String,
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Nomine", nomineSchema);
