import jwt from "jsonwebtoken";

//verifyJwt middleware

const verifyJwt = (req, res, next) => {
  const secret = process.env.JWT_SECRET;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).send({ message: "authorization failed" });
  }
  jwt.verify(token, secret, (err, decode) => {
    if (err) {
      return res.status(403).json({ error: "Failed to authenticate token" });
    }
    req._id = decode._id;
    req.email = decode.email;
    next();
  });
};

export default verifyJwt;
