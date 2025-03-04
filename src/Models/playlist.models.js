import mongoose, {Schema} from "mongoose";

const playlistschema = new Schema({
    name:{
        type: String,
        required:true
    },
    desciption:{
         type: String,
         required : true
    },
    videos:{
        type: Schema.Types.ObjectId,
       ref : "video"
   },
   owner:{
       type: Schema.Types.ObjectId,
       ref : "user",
       }
    

},
{timestamps:true})

export const  playlist=mongoose.model("playlist" , playlistschema)  