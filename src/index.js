import connect from "./Db/DB.js"
import Dotenv from "dotenv"

Dotenv.config({
    path:'./env'
})

connect() 