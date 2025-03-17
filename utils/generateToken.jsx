const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const payload = {
    id: user._id, // Use the user's _id from the database
    username: user.username, // Optional: Include additional user data
  };

  const token = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: "1h", // Token expiration time
  });

  return token;
};

module.exports = generateToken;