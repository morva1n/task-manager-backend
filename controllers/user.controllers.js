import * as user from '../services/user.services.js'


export const registrationUser = async (req, res, next) =>{
    try{    
        const {email, password} = req.body;
        const newUser = await user.registration(email, password)
        res.status(201).json(newUser)
    } catch(error){
        next(error)
    }
}

export const loginUser = async (req, res, next) => {
    try{
        const {email, password} = req.body;
        const userData = await user.login(email, password)
        res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true})
        res.status(200).json(userData) 
    }catch(error){
        next(error)
    }
}

export const logoutUser = async (req, res, next) =>{
    try{
        const {refreshToken} = req.cookies;
        const userData = await user.logout(refreshToken)
        res.clearCookie('refreshToken')
        res.json(userData)
    } catch(error){
        next(error)
    }
}

export const refreshUser = async (req, res, next) =>{
    try{
        const refreshToken = req.cookies.refreshToken;
        const token = await user.refresh(refreshToken);
        res.json(token)
    }
    catch(error){
        next(error)
    }

}


