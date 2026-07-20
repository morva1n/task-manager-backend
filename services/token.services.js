import jwt from 'jsonwebtoken'
import { supabase } from '../supabaseClient.js'
import { ErrorApp } from '../errors/ErrorApp.js';

const findUserToken = async(userId) =>{
    const {data, error} = await supabase.from('tokens').select('*').eq('userId', userId);
    if (error) throw new ErrorApp('Failed to find token', 500)
    return data.length > 0;
}

export const generateAccessToken = async (payload) => {
    try{
        const accessToken = jwt.sign(payload, process.env.JWT_KEY, {expiresIn: '30m'})
        return accessToken;    
    }
    catch(error){
        throw new ErrorApp('Failed to generate access token.', 500)
    }
    
}

export const generateRefreshToken = async (payload) => {
    try{
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_KEY, {expiresIn: '30d'})
        return refreshToken;    
    }
    catch(error){
        throw new ErrorApp('Failed to generate refresh token.', 500)
    }
}

export const assignToken = async(userId, refreshToken) =>{
    if (await findUserToken(userId)) {
        const {data, error} = await supabase.from('tokens').update({refreshToken}).eq('userId', userId).select('*');
        if (error) throw new ErrorApp('Failed to assign token.', 500);

        return data;
    }
    const {data, error} = await supabase.from('tokens').insert({userId, refreshToken}).select('*');
    if (error) throw new ErrorApp('Failed to assign token.', 500);

    return data;
};

export const findRefreshToken = async(refreshToken) =>{
    const {data, error} = await supabase.from('tokens').select('refreshToken').eq('refreshToken', refreshToken).single();
    if(error) throw new ErrorApp('Failed to find refresh token.', 500);
    
    return true;
}