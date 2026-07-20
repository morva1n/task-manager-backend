import jwt from 'jsonwebtoken'

export const authMiddleware = (req, res, next) =>{
    const auth = req.headers.authorization;
    if(!auth){
        return next(new ErrorApp("Unauthorized!", 401)) 
    }

    const [type, accessToken] = auth.split(' ');
    
    if(type !== 'Bearer' || !accessToken){
        return next(new ErrorApp('Invalid or missing access token', 401))
    }

    try{
        const userData = jwt.verify(accessToken, process.env.JWT_KEY);
        req.user = userData
        next()   
    }
    catch(error){
        next(new ErrorApp('Invalid or expired access token.'), 401);
    }
    
}