import { ErrorApp } from "../errors/ErrorApp.js"

export const validationMiddleware = (schema) =>{
    return(req, res, next) =>{
        const output = schema.safeParse(req.body);
        if(!output.success){
            const issues = output.error.issues;
            const errors = []
            issues.map(el => {
                errors.push({message: el.message})
            })
            return next(new ErrorApp('Invalid request data', 400, errors))
        }
        next()
    }
}