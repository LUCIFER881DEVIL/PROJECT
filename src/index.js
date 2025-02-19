import connect from "./Db/DB.js"
import Dotenv from "dotenv"

Dotenv.config({
    path:'./env'
})

connect() 
.then(()=>{
    app.listen(process.env.PORT || 8000 ,()=>{
        console.log(`MONGODB IS CONNECTED SUCCESSFULLY at PORT ${process.env.PORT}`)
    })
    
})
.catch((error)=>{
    console.log("Error Occured",error)
    
})