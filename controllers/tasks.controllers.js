import { supabase } from "../supabaseClient.js";

export const getTasks = async (req, res) =>{
    const { data, error } = await supabase
        .from("tasks")
        .select("*");

    if (error) {
        return res.status(500).json(error);
    }

    res.json(data);
}

export const createTask = async (req, res) =>{
    const {name, description} = req.body;

    const {data, error} = await supabase
        .from("tasks")
        .insert({name, description})
        .select()
    
    if(error){
        return res.status(500).json(error)
    }

    res.json(data)
}

export const changeTask = async(req, res) =>{
    const {id} = req.params;
    const {name, description} = req.body;
    
    const {data, error} = await supabase
        .from("tasks")
        .update({name}) //тут треба зробити умову зміни даних!!
        .eq("id", Number(id))
        .select("*")

    if(error){
        return res.status(500).json(error)
    }

    res.json(data)
}

export const deleteTask = async(req, res) =>{
    const {id} = req.params;

    const{data, error} = await supabase
        .from("tasks")
        .delete()
        .eq("id", Number(id))
        .select("*")
    
    if(error){
        return res.status(500).json(error)
    }

    res.json(data)
}