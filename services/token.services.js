import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { supabase } from '../supabaseClient.js'

dotenv.config()

const findUserToken = async(userId) =>{
    const {data, error} = await supabase.from('tokens').select('*').eq('userId', userId);
    if(error) throw error;
    return data.length > 0;
}

export const generateToken = async (payload) => {
    const accessToken = jwt.sign(payload, process.env.JWT_KEY, {expiresIn: '30m'})
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_KEY, {expiresIn: '30d'})
    return {
        accessToken, refreshToken
    }
}

export const assignToken = async(userId, refreshToken) =>{
    if (await findUserToken(userId)) {
        const {data, error} = await supabase.from('tokens').update({refreshToken}).eq('userId', userId).select('*');
        if (error) throw error;

        return data;
    }
    const {data, error} = await supabase.from('tokens').insert({userId, refreshToken}).select('*');
    if(error) throw error;

    return data;
};