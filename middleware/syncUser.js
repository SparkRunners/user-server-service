const User = require("../models/User");

async function syncUser(req, res, next) {
  try {
    let user = await User.findOne({ userId: req.user.id });

    if (!user) {
      user = new User({
        userId: req.user.id,
        email: req.user.email || "unknown@example.com",
        name: req.user.name || "Unknown User",
        balance: 1000,
      });
      await user.save();
      console.log(`User: ${user.userId} (${user.email}) was created`);
    }

    req.dbUser = user;
    next();
  } catch (error) {
    console.error(`syncUser error:`, error);
    res.status(500).json({ error: "Failed to sync user" });
  }
}

module.exports = { syncUser };
