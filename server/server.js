const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Vault = require("./models/vault");
const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log(err));


app.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Save new user
    const newUser = new User({ fullName, email, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// Other Vault routes
app.get("/vault/:userEmail", async (req, res) => {
  const entries = await Vault.find({ userEmail: req.params.userEmail });
  res.json(entries);
});

app.post("/vault", async (req, res) => {
  const newEntry = new Vault(req.body);
  await newEntry.save();
  res.json({ message: "Saved!" });
});

app.put("/vault", async (req, res) => {
  const { userEmail, website, username, password } = req.body;

  const updated = await Vault.findOneAndUpdate(
    { userEmail, website, username },
    { password },
    { new: true, upsert: true }
  );
  res.json(updated);
});



// Add after the signup route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check password (in production, hash with bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful", email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});


// Get all saved passwords
app.get("/vault/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.passwords || []);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Save or update password
app.post("/vault/:email", async (req, res) => {
  const { email } = req.params;
  const entry = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.passwords.findIndex(
      (e) => e.id === entry.id
    );

    if (index >= 0) {
      user.passwords[index] = entry;
    } else {
      user.passwords.push(entry);
    }

    await user.save();
    res.json({ message: "Password saved" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


app.delete("/vault/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Vault.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Entry not found" });
    }
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Server error during delete" });
  }
});


app.post("/userinfo", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ fullName: user.fullName });
});



// ✅ Start server
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
