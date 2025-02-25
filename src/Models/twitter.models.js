import mongoose, {Schema} from "mongoose";

const twitterschema = new Schema({
    content:{
        type: String,
        required :true
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref : "user",
        },

},
{timestamps:true})


export const  twitter=mongoose.model("twitter" , twitterschema)  