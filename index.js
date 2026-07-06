import dotenv from "dotenv"
import express from "express"
import { supabase } from "./supabaseClient.js";
import cors from "cors"


const app = express();

dotenv.config();

app.use(cors({
    origin: process.env.CLIENT_URL
}));
app.use(express.json());

app.get("/tasks", async (req, res) => {

    const { data, error } = await supabase
        .from("tasks")
        .select("*");

    if (error) {
        return res.status(500).json(error);
    }

    res.json(data);
});


app.post("/tasks", async (req, res) =>{
    const {name, description} = req.body;

    const {data, error} = await supabase
        .from("tasks")
        .insert({name, description})
        .select()
    
    if(error){
        return res.status(500).json(error)
    }

    res.json(data)
})

app.patch("/tasks/:id", async(req, res) =>{
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

})

app.delete("/tasks/:id", async (req, res) =>{
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
})

app.listen(process.env.PORT, () =>{
    console.log(`Server is running at ${process.env.PORT} port`)
})