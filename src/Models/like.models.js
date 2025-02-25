import mongoose, {Schema} from "mongoose";

const likeschema = new Schema({
    comment:{
        type: Schema.Types.ObjectId,
        ref : "comment"
    },
    videos:{
         type: Schema.Types.ObjectId,
        ref : "video"
    },
    likedby:{
        type: Schema.Types.ObjectId,
        ref : "user",
        required:true
        },
    tweets:{
        type: Schema.Types.ObjectId,
        ref : "twitter"
    }
    

},
{timestamps:true})

export const  like=mongoose.model("like" , likeschema)  