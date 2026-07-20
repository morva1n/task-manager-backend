import { supabase } from "../supabaseClient.js";
import * as tasks from '../services/tasks.services.js'

export const listTasks = async (req, res, next) =>{
    try{
        const userId = req.user.id;
        const getTasks = await tasks.getTasks(userId);
        res.status(200).json(getTasks);
    }
    catch(error){
        next(error)
    }
}

export const addTask = async (req, res, next) =>{
    try{
        const userId = req.user.id;
        const {name, description} = req.body;
        const createTask = await tasks.createTask(name, description, userId);
        res.status(200).json(createTask)    
    }
    catch(error){
        next(error)
    }
    
}

export const updateTask = async(req, res, next) =>{
    try{
        const userId = req.user.id;
        const {id} = req.params;
        const {name, description} = req.body;
        const changeTask = await tasks.changeTask(userId, id, name, description)
        res.status(200).json(changeTask)   
    }
    catch(error){
        next(error)
    }
    
    
}

export const markTaskAsComplete = async(req, res, next) =>{
    try{
        const userId = req.user.id;
        const {id} = req.params;
        const {finished} = req.body;

        const completeTask = await tasks.completeTask(userId, id, finished)
        res.status(200).json(completeTask)
    }
    catch(error){
        next(error)
    }
}

export const removeTask = async(req, res, next) =>{
    try{
        const userId = req.user.id;
        const {id} = req.params;

        const deleteTask = await tasks.deleteTask(userId, id);

        res.status(200).json(deleteTask)
    }
    catch(error){
        next(error)
    }
}