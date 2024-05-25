import jwt from "jsonwebtoken";

function jwtToken(result) {
  const JWT_SECRET = process.env.JWT_SECRET;
  const access_token = jwt.sign(
    {
      _id: result._id,
      email: result.email,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  return access_token;
}

export default jwtToken;
