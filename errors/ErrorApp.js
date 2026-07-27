export class ErrorApp extends Error{
    constructor(message, status, errors){
        super(message)
        this.status = status
        this.errors = errors
    }
}