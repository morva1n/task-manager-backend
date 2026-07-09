import { supabase } from "../supabaseClient.js"
import bcrypt from 'bcrypt'

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

export const registration = async (email, password) =>{
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