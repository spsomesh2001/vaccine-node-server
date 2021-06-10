const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    let decodedData = jwt.verify(token, process.env.JWT_KEY);
    
    req.userId = decodedData?.id;
    req.userEmail = decodedData?.email;

    next();
  } catch (error) {
    res.status(400).json({ message: "Authentication Error", error });
  }
};

module.exports = auth;
