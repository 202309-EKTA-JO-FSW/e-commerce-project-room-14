const jwt=require("jsonwebtoken");
const Access_Token_Key = process.env.Access_Token_Key; // Access secret key
const authenticateAdmin=async(req,res,next)=>
{
    const token =req.cookies.jwt;// Retrieve token from cookies
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' }); // No token provided
    }
    try {
        const decoded = jwt.verify(token, Access_Token_Key); // Verify token authenticity
        if (!decoded.isAdmin) {
          return res.status(403).json({ message: 'Forbidden: Admin access required' }); // Not an admin
        }
        req.user = decoded; // Attach user information to the request object
        next(); // Proceed to the endpoint
      } catch (error) {
        console.error(error); // Handle token-related errors
        return res.status(401).json({ message: 'Unauthorized' }); // Invalid or expired token
      }
}
module.exports={authenticateAdmin};