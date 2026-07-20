export class ErrorApp extends Error{
    constructor(message, status){
        super(message)
        this.status = status
    }
}