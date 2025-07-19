const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  passwords: [
    {
      website: String,
      username: String,
      password: String,
      id: String,
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
