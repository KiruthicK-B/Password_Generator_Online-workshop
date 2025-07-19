const mongoose = require("mongoose");

const vaultSchema = new mongoose.Schema({
  userEmail: String,
  website: String,
  username: String,
  password: String,
});

module.exports = mongoose.model("Vault", vaultSchema);
