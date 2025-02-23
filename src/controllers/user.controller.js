import {asynchandler} from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js";
import {user} from "../Models/user.models.js";
import {uploadoncloudinary} from "../utils/cloudinary.js";
import{Apiresponses} from "../utils/Apiresponses.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
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

const refreshaccesstoken = asynchandler(async(req , res)=>{
    const incomingrefreshtoken =req.cookies?.refreshToken || req.body.refreshToken

    if (!incomingrefreshtoken) {
        throw new ApiError(404, "token not Found ")
    }

try {
    const decodedtoken =  jwt.verify(incomingrefreshtoken,process.env.REFRESH_TOKEN_SECRET)
    if (!decodedtoken) {
        throw new ApiError(404, "token not Found ")
    }
        const users = await user.findById(decodedtoken?._id)
        if (!users) {
            throw new ApiError(404, " user not found ")}
    
        if (incomingrefreshtoken!==users?.RefreshTokens) {
            throw new ApiError(404, " token is expires or  not found ")
        }
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(users._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("newrefreshToken", newRefreshToken, options)
        .json(
            new Apiresponses(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    
} catch (error) {
    throw new ApiError(404, error?.message||"invalid refresh token")

}
})

const changecurrentpassword = asynchandler(async(req, res)=>{

    const{oldpassword , newpassword}=req.body
    const user2= await user.findById(req.user?._id)
    const isPasswordCorrect= await user2.isPasswordCorrect(oldpassword)

    if (!isPasswordCorrect) {
        throw new ApiError(404 , "password is incorrect")
    }
    user2.Password=newpassword
    await user2.save({validateBeforeSave:false})
    return res
    .status(200)
    .json(
        new Apiresponses( 200, {}, "Password changed Succesfully"))


})

const getCurrentUser = asynchandler(async(req, res) => {
    return res
    .status(200)
    .json(new Apiresponses(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const updateaccountinfo =asynchandler(async(req , res)=>{
    const{Fullname , Email}=req.body
    if (!Fullname || !Email) {
        throw new ApiError(404 ,"info not exist ")
    }
    const user3 = await user.findByIdAndUpdate(req.user3?._id,{
        $set:{
            Fullname,
            Email
        }
    },{
        new:true
    }
).select('-Password')

return res
    .status(200)
    .json(new Apiresponses(
        200,
        user3,
        "Account details updated Succesfully "))

})

const updateavatarinfo=asynchandler(async(req , res )=>{
    const AvatarLocalpath=req.file?.path
    if (!AvatarLocalpath) {
        throw new ApiError(400 , "Path is not specified")
    }

    const Avatar = await uploadoncloudinary(AvatarLocalpath)
    if (!Avatar.url) {
        throw new ApiError(400 , "url is not specified")

    }
    const user4 = await user.findByIdAndUpdate(
        req.User3?._id,{
            $set:{
                Avatar:Avatar.url
            }
        },{
            new:true
        }
    ).select("-Password")

    return res
    .status(200)
    .json(
        new Apiresponses(
        200, user4 , "Avatar Image Updated Successfully")
    )
})

const updatcoverimageinfo=asynchandler(async(req , res )=>{
    const CoverImageLocalpath=req.file?.path
    if (!CoverImageLocalpath) {
        throw new ApiError(400 , "Path is not specified")
    }

    const CoverImage = await uploadoncloudinary(CoverImageLocalpath)
    if (!CoverImage.url) {
        throw new ApiError(400 , "url is not specified")

    }
    const user5 = await user.findByIdAndUpdate(
        req.User3?._id,{
            $set:{
                CoverImage:CoverImage.url
            }
        },{
            new:true
        }
    ).select("-Password")
    return res
    .status(200)
    .json(
        new Apiresponses(
        200, user5 , "cover Image Updated Successfully")
    )
})

const getuserchannelprofile = asynchandler(async (req, res) => {
    const { username } = req.params;

    // Validate the username parameter
    if (!username?.trim()) {
        throw new ApiError(400, "Username is not defined");
    }

    console.log("Fetching profile for username:", username);

    const channel = await user.aggregate([
        // Match the user by username (case insensitive)
        {
            $match: {
                username: username.toLowerCase()
            }
        },

        // Lookup for subscribers
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "channel",
                as: "Subscribers"
            }
        },

        // Lookup for channels subscribed by the user
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "Subscribedbyme"
            }
        },

        // Add calculated fields for subscribers count and subscribed channels count
        {
            $addFields: {
                subscriberscount: {
                    $size: {
                        $ifNull: ["$Subscribers", []]
                    }
                },
                channelsubscribedcount: {
                    $size: {
                        $ifNull: ["$Subscribedbyme", []]
                    }
                },
                issubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$Subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },

        // Project only the necessary fields
        {
            $project: {
                username: 1,
                Fullname: 1,
                subscriberscount: 1,
                channelsubscribedcount: 1,
                Avatar: 1,
                CoverImage: 1,
                issubscribed: 1,
                Email: 1
            }
        }
    ]);

    // If no channel is found, return an error
    if (!channel?.length) {
        console.error("Channel not found for username:", username);
        throw new ApiError(400, "Channel does not exist");
    }

    console.log("Channel Profile Fetched:", channel[0]);

    // Return the channel details as response
    return res
        .status(200)
        .json(new Apiresponses(200, channel[0], "Channel fetched successfully"));
});

const getuserwatchhistory=asynchandler(async(req , res)=>{
    const user6 = user.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user6._id)
            }
        },
        {
            $lookup:{
                from:"video",
                localField:"Watchhistory",
                foreignField:"_id",
                as:"Watchhistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"user",
                            localField:"Owner",
                            foreignField:"_id",
                            as:"Owner",
                            pipeline:[
                                {
                                    $project:{
                                        Fullname:1,
                                        username:1,
                                        Avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            Owner:{
                                $first:"$Owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    return res
    .status(200)
    .json(
        new Apiresponses(200 ,user6[0].Watchhistory,"watch history fetched successfully")
    )
    
})




export {registeration , loginuser, logoutuser,refreshaccesstoken, changecurrentpassword,getCurrentUser,updateaccountinfo,updateavatarinfo,updatcoverimageinfo , getuserchannelprofile,getuserwatchhistory}
// export default loginuser