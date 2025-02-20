import {asynchandler} from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js";
import {user} from "../Models/user.models.js";
import {uploadoncloudinary} from "../utils/cloudinary.js";
import{Apiresponses} from "../utils/Apiresponses.js";


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
    const{Fullname , Email , username , Password }=req.body
    console.log("email : " , Email);

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
    const userexist = await user.findOne({
        $or:[{username},{Email}]
    })
    if (userexist) {
        throw new ApiError(400 , "someng is wrong")
    }
    // console.log(req.files);
    // console.log(req.body);
    // console.log(req.user);
    const AvatarLocalpath = req.files?.Avatar[0]?.path;
    const CoverImageLocalpath = req.files?.CoverImage[0]?.path;
    if (!AvatarLocalpath) {
        throw new ApiError(400 , "someth is wrong")

    }
    const Avatar = await uploadoncloudinary(AvatarLocalpath)
    const CoverImage = await uploadoncloudinary(CoverImageLocalpath)
    if (!Avatar) {
        throw new ApiError(400 , "something is wrong")

    }
    const User = await user.create({
        Fullname,
        Email,
        Password,
        Avatar : Avatar.url,
        CoverImage:CoverImage?.url || "",
        username:username.toLowerCase()
    })
    const createduser = await user.findById(User._id)
    .select(
        "-Password -RefreshTokens"
    )
    if (!createduser) {
        throw new ApiError(400 , "something is wng")

    }
    return res.status(200).json(
        new Apiresponses(200 , createduser , "user registered succesfully")
    )
})

export default registeration