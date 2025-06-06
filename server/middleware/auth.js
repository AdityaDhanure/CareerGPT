import jwt from 'jsonwebtoken';

// Middleware to authenticate requests using JWT tokens
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).json({
            msg: "No token provided!"
          });
  try {
    const verifiedValue = jwt.verify(token, process.env.JWT_SECRET)
    // console.log('Verified Value:', verifiedValue);
    if (verifiedValue.id) {
      req.id = verifiedValue.id;
      next();
    } else {
      res.status(403).json({
        msg: 'You are not authenticated'
      });
    }
  } catch (err) {
    res.status(403).json({
      msg: 'Invalid or expired token'
    });
  }
};

export default authMiddleware;
