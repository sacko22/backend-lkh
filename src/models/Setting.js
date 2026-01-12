const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  voteActif: {
    type: Boolean,
    default: true
  },
  dateDebutVote: {
    type: Date
  },
  dateFinVote: {
    type: Date
  },
  edition: {
    type: String
  },
  annee: {
    type: Number
  }
}, { timestamps: true });

module.exports = mongoose.model("Setting", settingSchema);
