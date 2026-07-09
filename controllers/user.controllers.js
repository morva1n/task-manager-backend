import { supabase } from "../supabaseClient.js";
import * as user from '../services/user.services.js'

export const registrationUser = async (req, res, next) =>{
    const {email, password} = req.body;
    const newUser = await user.registration(email, password)
    try{
        res.status(201).json(newUser)
    } catch(error){
        res.status(500).json(error)
    }
}

export const loginUser = async (req, res, next) =>{
    const {email, password} = req.body;
}
