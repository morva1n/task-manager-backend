import { ErrorApp } from "../errors/ErrorApp.js"
import { supabase } from "../supabaseClient.js"

export const checkData =  async(name, description) =>{
    const updateTask = {}
    
    if(name !== undefined && name !==' '){updateTask.name = name}
    if(description !== undefined && description !==' '){updateTask.description = description}

    return updateTask;
}

export const getTasks = async(userId) =>{
    const { data, error } = await supabase.from("tasks").select("*").eq('userId', userId);
    if (error) throw new ErrorApp('Failed to get tasks.', 500)

    return data;
}

export const createTask = async(name, description, userId) =>{
    const {data, error} = await supabase.from("tasks").insert({name, description, userId}).select()
    if(error) throw new ErrorApp('Failed to create task.', 500)

    return data;
}

export const changeTask = async(userId, id, name, description) =>{
    const updateTask = await checkData(name, description)
    const {data, error} = await supabase.from("tasks").update(updateTask).eq("id", Number(id)).eq("userId", userId).select("*")
    if(error) throw new ErrorApp('Failed to change task.', 500)

    return data;
}

export const completeTask = async(userId, id, finished) =>{
    const{data, error} = await supabase.from("tasks").update({finished}).eq("id", Number(id)).eq("userId", userId).select("*")
    if(error) throw new ErrorApp('Failed to complete task.', 500)

    return data;
}

export const deleteTask = async(userId, id) =>{
    const{data, error} = await supabase.from("tasks").delete().eq("id", Number(id)).eq("userId", userId).select("*")
    if(error) throw new ErrorApp('Failed to delete task.', 500)

    return data;
}