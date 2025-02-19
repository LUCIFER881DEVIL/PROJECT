import {asynchandler} from "../utils/asynchandler.js";

const registeration = asynchandler(async(req , res)=>{
     res.status(200).json({
        message:"done"
    })
})

export default registeration