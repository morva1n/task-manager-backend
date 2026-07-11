import { supabase } from "../supabaseClient.js";
import * as user from '../services/user.services.js'

export const registrationUser = async (req, res, next) =>{
    const {email, password} = req.body;
    const newUser = await user.registration(email, password)
    try{
        res.status(201).json(newUser)
    } catch(error){
        res.status(500).json({
            'message': error.message
        })
    }
}

export const loginUser = async (req, res, next) => {
    const {email, password} = req.body;
    try{
        const loginUser = await user.login(email, password)   
        res.status(200).json(loginUser) 
    }catch(error){
        res.status(401).json({
            'message': error.message
        })
    }
}
