import { Error } from "mongoose"

class ApiError extends Error {
    constructor(
        statusCode,
        message,
        data={},
        errors=[],
        stack=""

    ){
        super(message)
        this.statusCode=statusCode,
        this.data = data,
        this.errors=errors,
        this.success = false,
        this.message=message

        if (stack) {
            this.stack=stack
        } else {
            Error.captureStackTrace(this , this.constructor)
        }
    }

}
export{ApiError}