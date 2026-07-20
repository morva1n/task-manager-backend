export const errorMiddleware = async(err, req, res, next) =>{
    res.status(err.status).json(err.message)
}