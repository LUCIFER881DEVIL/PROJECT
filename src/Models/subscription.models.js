import mongoose, {Schema, schems} from "mongoose";

const subscriptionschema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId,//one who is subscribing
        ref : "user"
    },
    channel:{
         type: Schema.Types.ObjectId,
        ref : "user"
    }
},{timestamps:true})

export const  subscription=mongoose.model("subscription" , subscriptionschema)  