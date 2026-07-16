import { supabase } from "../supabaseClient.js"
import bcrypt from 'bcrypt'
import * as token from '../services/token.services.js'
import cookieParser from "cookie-parser";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const checkUserExists = async (email) => {
    const { data, error } = await supabase
        .from("users")
        .select("id, email")
        .eq("email", email.trim())
        .limit(1);

    if (error) {
        throw error;
    }
    return data.length > 0;
};

export const registration = async (email, password) => {
    if(await checkUserExists(email)){
        throw new Error(`User with email "${email}" already exists.`)
    }
    const hashPassword = await bcrypt.hash(password, 10)

    const {data, error} = await supabase.from('users').insert({email, password: hashPassword}).select("id, email");

    if(error){
        throw error;
    }

    return data;
}


export const login = async (email, password) => {
    const {data, error} = await supabase
        .from('users').select('id, email, password').eq('email', email).single()
    if(error){
        throw error
    }
    const isPasswordValid = await bcrypt.compare(password, data.password)
    if(!isPasswordValid){
        throw new Error('Invalid password!')
    }
    const accessToken = await token.generateAccessToken({id: data.id, email: data.email})
    const refreshToken = await token.generateRefreshToken({id: data.id, email: data.email})

    const refresh = await token.assignToken(data.id, refreshToken)
    return {accessToken, refreshToken};
}


export const logout  = async (refreshToken) => {
    const {data, error} = await supabase
        .from("tokens").delete().select('id, refreshToken').eq('refreshToken', refreshToken).single();
    if(error){
        throw error
    }
    return data;
}

export const refresh = async (refreshToken) =>{
    const findRefreshToken = await token.findRefreshToken(refreshToken)
    if(!findRefreshToken){
        throw new Error('Bad!')
    }
    const data = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);

    const accessToken = token.generateAccessToken({id: data.id, email: data.email})

    return accessToken;
}

