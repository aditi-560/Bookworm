import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectRoute = async(req, res) => {
    try{
        const token = req.header("Authorization").replace("Brarer ", "");
        if(!token){
            return res.status(401).json({message:"No authentication token, access denied"});

        }

        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // find user
        const user  =await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(401).json({message:"Token not found"});
        }
        req.user = user;
        next();

    }catch(err){
        console.log("Authenticaltion error", err);
        res.status(500).json({message:"Server error"});
    }
};

export default protectRoute;