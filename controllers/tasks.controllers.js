import { supabase } from "../supabaseClient.js";
import * as tasks from '../services/tasks.services.js'

export const getTasks = async (req, res) =>{
    const userId = req.user.id;
    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq('userId', userId);
    if (error) {
        return res.status(500).json(error);
    }

    res.json(data);
}

export const createTask = async (req, res) =>{
    const userId = req.user.id;
    const {name, description} = req.body;

    const {data, error} = await supabase
        .from("tasks")
        .insert({name, description, userId})
        .select()
    
    if(error){
        return res.status(500).json(error)
    }

    res.json(data)
}

export const changeTask = async(req, res) =>{
    const {id} = req.params;
    const {name, description} = req.body;
    const updateTask = await tasks.checkData(name, description)
    const {data, error} = await supabase
        .from("tasks")
        .update(updateTask)
        .eq("id", Number(id))
        .select("*")

    if(error){
        return res.status(500).json(error)
    }

    res.json(data)
}

export const completeTask = async(req, res) =>{
    const {id} = req.params;
    const {finished} = req.body;

    const{data, error} = await supabase
        .from("tasks")
        .update({finished})
        .eq("id", Number(id))
        .select("*")
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