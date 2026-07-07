export const checkData = (name, description) =>{
    const updateTask = {}
    
    if(name !== undefined && name !==' '){updateTask.name = name}
    if(description !== undefined && description !==' '){updateTask.description = description}

    return updateTask;
}