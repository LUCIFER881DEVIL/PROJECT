import {asynchandler} from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js";
import {user} from "../Models/user.models.js";
import {uploadoncloudinary} from "../utils/cloudinary.js";
import{Apiresponses} from "../utils/Apiresponses.js";
// import jwt from "jsonwebtoken";
// import mongoose from "mongoose";



const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const User = await user.findById(userId)
        const accessToken = User.generateAccessToken()
        const refreshToken = User.generateRefreshToken()

        User.RefreshTokens = refreshToken
        await User.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}
const registeration = asynchandler(async(req , res)=>{
    /*
    STEPS FOR REGISTERING A USER
    1. GET DETAILS OF USER FROM THE FRONTEND 
    2. VALIDATION OF DATA
    3. CHECK IF USER IS ALREADY EXIST OR NOT
    4. CHECK FOR IMAGE , AVATAR
    5. UPLOAD ON CLOUDINARY
    6. CREATE USER OBJECT - CREATE ENTRY IN DB
    7. REMOVE PSWDOR REFRESH TOKENS FROM RESPONSES
    8. CHECK FOR USER CREATION 
    9. SEND RES
    */ 

    //  1. GETTING DETAILS FROM THE USER
    const{Fullname , Email , username , Password }=req.body
    console.log("email : " , Email);
    //  2 . VALIDATION OF DATA 
    if (Fullname === "") {
        throw new ApiError(400 , "some is wrong")
        
    }
    if (Email === "") {
        throw new ApiError(400 , "something wrong")
        
    }
    if (username === "") {
        throw new ApiError(400 , "something i wrong")
        
    }
    if (Password === "") {
        throw new ApiError(400 , "something is wrng")
        
    }

    // 3. CHECK IF USER IS ALREADY EXIST OR NOT

    const userexist = await user.findOne({
        $or:[{username},{Email}]
    })
    if (userexist) {
        throw new ApiError(400 , "someng is wrong")
    }
    // console.log(req.files);
    // console.log(req.body);
    // console.log(req.user);

    // 4. CHECK FOR IMAGE , AVATAR

    const AvatarLocalpath = req.files?.Avatar[0]?.path
    // const CoverImageLocalpath = req.files?.CoverImage[0]?.path;
    let CoverImageLocalpath;
    if(req.files && Array.isArray(req.files.CoverImage)&& req.files.CoverImage.length > 0 ){
        CoverImageLocalpath=req.files.CoverImage[0].path
    }
    if (!AvatarLocalpath) {
        throw new ApiError(400 , "someth is wrong")

    }

    //     5. UPLOAD ON CLOUDINARY

    const Avatar = await uploadoncloudinary(AvatarLocalpath)
    const CoverImage = await uploadoncloudinary(CoverImageLocalpath)
    if (!Avatar) {
        throw new ApiError(400 , "something is wrong")

    }

    //     6. CREATE USER OBJECT - CREATE ENTRY IN DB

    const User = await user.create({
        Fullname,
        Email,
        Password,
        Avatar : Avatar.url,
        CoverImage:CoverImage?.url || "",
        username:username.toLowerCase()
    })

    // 7. CHECK USER  EXISTS AND REMOVE PSWDOR REFRESH TOKENS FROM RESPONSES

    const createduser = await user.findById(User._id)
    .select(
        "-Password -RefreshTokens"
    )
    if (!createduser) {
        throw new ApiError(400 , "something is wng")

    }

    // RETURN RESPONSES
    return res.status(200).json(
        new Apiresponses(200 , createduser , "user registered succesfully")
    )
})

const loginuser = asynchandler(async(req , res)=>{
    /* STEPS FOR LOGIN 
    1. GET DATA FROM REQ.BODY
    2. USERNAME OR EMAIL BASED LOGIN
    3. USER FIND
    4. PASSWORD CHECK
    5. ACCESS TOKEN AND REFRESH TOKEN GENERATION
    6. SEND TOKENS USING COOKIES
    */

    const {username , Email , Password}=req.body

    if (!username && !Email) {
        throw new ApiError(400 , "Either Username or Email is requires ")
    }

    const User = await user.findOne({
        $or:[{Email},{username}]
    })
    if (!User) {
        throw new ApiError(404 , "user does not exist")
    }

    const isPasswordvalid = await User.isPasswordCorrect(Password)
    if (!isPasswordvalid) {
        throw new ApiError(401 , "Password is Incorrect")

    }

    const{accessToken , refreshToken}= await generateAccessAndRefereshTokens(User._id)

    const loggedinuser = await user.findById(User._id).select("-Password -RefreshTokens")

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken , options)
    .cookie("refreshToken",refreshToken, options)
    .json(
        new Apiresponses(
            200,{
        User:loggedinuser , accessToken,refreshToken
    },
    "User logged in Successfully"
))
})
const logoutuser = asynchandler(async (req, res) => {
    // Before using req.user._id, check if req.user is defined
    if (!req.user) {
        throw new ApiError(401, "User not authenticated");
    }

    // Safe way to access _id
    const userId = req.user?._id;
    console.log("User ID:", userId);

    // Update the user to remove refresh tokens
    await user.findByIdAndUpdate(
        userId,    // Use the extracted userId here
        {
            $unset: {
                RefreshTokens: 1
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new Apiresponses(200, {}, "User logout successfully")
        );
});



export {registeration , loginuser, logoutuser}
// export default loginuser