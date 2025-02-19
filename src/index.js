import connect from "./Db/DB.js"
import dotenv from "dotenv"
import { app } from "./app.js"

dotenv.config({
    path:'./env'
})

connect() 
.then(()=>{
    app.listen(process.env.PORT ||8000 ,()=>{
        console.log(`MONGODB IS CONNECTED SUCCESSFULLY at PORT ${process.env.PORT}`)
    })
    
})
.catch((error)=>{
    console.log("Error Occured",error)
    
})