import mongoose, { Schema } from "mongoose";
import Jwt, { JsonWebTokenError } from "jsonwebtoken";
import bcrypt from 'bcrypt';

const userschema = new Schema(
    {
        username:{
            type:String,
            required : true,
            unique: true,
            lowercase : true,
            trim : true,
            index : true
        },
        Email:{
            type:String,
            required : true,
            unique: true,
            lowercase : true,
            trim : true,
        },
        Fullname:{
            type:String,
            required : true,
            trim : true,
            index : true
        },
        Avatar:{
            type:String,
            required : true,
        },
        CoverImage:{
            type:String,
            required : true,
        },
        Watchhistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"video"

            }
        ],
        Password:{
            type:String,
            required:[true, 'Password is Required']
        },
        RefreshTokens:{
            type:String
        }
    },
    {
        timestamps:true
    }
)

userschema.pre("save",async function (next) {
    if(!this.isModified("Password"))return next();

    this.Password=bcrypt.hash(this.Password, 10)
    next()
})

userschema.methods.isPasswordCorrect = async function (Password) {
    return await bcrypt.compare(Password,this.Password)
}
userschema.methods.generateAccessToken=function(){
  return  Jwt.sign(
  {

        _id:this._id,
        Email:this.Email,
        username:this.username,
        Fullname:this.Fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }

)}
userschema.methods.generateRefreshToken=function(){
    return  Jwt.sign(
        {
      
              _id:this._id,
              Email:this.Email,
              username:this.username,
              Fullname:this.Fullname
          },
          process.env.REFRESH_TOKEN_SECRET,
          {
              expiresIn:process.env.REFRESH_TOKEN_EXPIRY
          }
)}

export const User=mongoose.model("User" , userschema)  