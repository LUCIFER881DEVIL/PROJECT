import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connect= async( )=>{
try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGOBD_URI}/${DB_NAME}`)
    console.log(`\n MongoDB is Connected Successfully !! DB HOST : ${connectionInstance.connection.host}`)
} catch (error) {
    console.log("Database Not Connected due to ",error);
    process.exit(1)
}
}

export default connect