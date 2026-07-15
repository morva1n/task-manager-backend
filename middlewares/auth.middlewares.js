import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const authMiddleware = async (req, res, next) =>{
    const auth = req.headers.authorization;
    if(!auth){
        throw new Error("Unauthorized!")
    }

    const [type, accessToken] = auth.split(' ');
    
    if(type !== 'Bearer' || !accessToken){
        throw new Error('Error bro!')
    }

    const userData = jwt.verify(accessToken, process.env.JWT_KEY);

    req.user = userData
    next()
}