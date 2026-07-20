import jwt from 'jsonwebtoken'
import { supabase } from '../supabaseClient.js'

const findUserToken = async(userId) =>{
    const {data, error} = await supabase.from('tokens').select('*').eq('userId', userId);
    if(error) throw error;
    return data.length > 0;
}

export const generateAccessToken = async (payload) => {
    const accessToken = jwt.sign(payload, process.env.JWT_KEY, {expiresIn: '30m'})
    return accessToken;
}

export const generateRefreshToken = async (payload) => {
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_KEY, {expiresIn: '30d'})
    return refreshToken;
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

export const findRefreshToken = async(refreshToken) =>{
    const {data, error} = await supabase.from('tokens').select('refreshToken').eq('refreshToken', refreshToken).single();
    if(error){
        return error;
    }
    return true;
}