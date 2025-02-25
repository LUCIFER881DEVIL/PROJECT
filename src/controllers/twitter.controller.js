import mongoose, { isValidObjectId } from "mongoose"
import {twitter} from "../Models/twitter.models.js"
import {user} from "../Models/user.models.js";
import {ApiError} from "../utils/ApiError.js"
import {Apiresponses} from "../utils/Apiresponses.js"
import {asynchandler} from "../utils/asynchandler.js"
// import{ uploadoncloudinary }from "../utils/cloudinary.js";

// const createtweet = asynchandler(async (req, res) => {
//     //TODO: create tweet

//     const { content } = req.body;
//     // const files = req.files;

//     // Validate Tweet content
//     if (!content?.trim()) {
//         throw new ApiError(400, "Tweet content cannot be empty");
//     }
//     if (content.length > 280) {
//         throw new ApiError(400, "Tweet content exceeds the character limit");
//     }

//     console.log("Creating tweet for user:", req.user?._id);

//     // // Initialize media array
//     // let mediaArray = [];

//     // // Handle media upload if files are present
//     // if (files?.length) {
//     //     console.log("Uploading media files...");
//     //     for (let file of files) {
//     //         const result = await uploadoncloudinary.uploader.upload(file.path, {
//     //             folder: "tweets",
//     //             resource_type: "auto"  // Automatically detects image/video
//     //         });

//     //         mediaArray.push({
//     //             url: result.secure_url,
//     //             type: file.mimetype.startsWith("image") ? "image" : "video"
//     //         });
//     //     }
//     // }

//     // Create a new tweet document
//     const tweet = await twitter.create({
//         content: content.trim(),
//         // media: mediaArray,
//         author: req.user._id,
//         // username:username.trim()
//     });

//     console.log("Tweet created:", tweet);

//     // Return response
//     return res
//     .status(201)
//     .json(
//        new Apiresponses(200,tweet,"tweet created succesfully"
//        ))
// });
const createtweet = asynchandler(async (req, res) => {
    const { tweetContent } = req.body;

    // Check if tweet content is provided
    if (!tweetContent?.trim()) {
        throw new ApiError(400, "Tweet content can't be empty");
    }

    // Get the authenticated user's info
    const userinfo = await user.findById(req.user._id).select("username Email");
    if (!userinfo) {
        throw new ApiError(404, "User not found");
    }

    // Create the tweet
    const newTweet = await twitter.create({
        content: tweetContent.trim(),
        owner: userinfo._id,
        username: userinfo.username,
        Email: userinfo.Email
    });
    await newTweet.save()
    return res
        .status(201)
        .json(new Apiresponses(201, newTweet, "Tweet created successfully"));
});


const getUsertweets = asynchandler(async (req, res) => {
    const { Email } = req.params;
    console.log("Email from params:", Email);

    if (!Email?.trim()) {
        throw new ApiError(400, "Email is not provided");
    }

    // Step 1: Get user by Email
    const userinfo = await user.findOne({ Email: Email }).select("_id");
    console.log("User info from DB:", userinfo);

    if (!userinfo) {
        throw new ApiError(404, "User not found");
    }

    // Step 2: Get tweets by owner
    const tweets = await twitter.find({ owner: userinfo._id })  // Using owner as per your schema
        .populate({
            path: "owner",  // owner is used in your twitter schema
            select: "Fullname Avatar CoverImage"
        })
        .sort({ createdAt: -1 });

    console.log("Tweets:", tweets);

    // Step 3: Return the tweets
    return res
        .status(200)
        .json(new Apiresponses(200, tweets, "Tweets fetched successfully"));
});

// const updatetweet = asynchandler(async (req, res) => {
    //TODO: update tweet
    // const{content}= req.getUsertweets
    // if (!content ) {
    //     throw new ApiError(404 , " content not available to update")
    // }

    const updatetweet = asynchandler(async (req, res) => {
        const { tweetId } = req.params;
        const { tweetContent } = req.body;
    
        console.log("Tweet ID from params:", tweetId);
        console.log("New Tweet Content:", tweetContent);
    
        // Check if tweetId and content are provided
        if (!tweetId?.trim()) {
            throw new ApiError(400, "Tweet ID is not provided");
        }
        if (!tweetContent?.trim()) {
            throw new ApiError(400, "New Tweet content can't be empty");
        }
    
        // Find the tweet by ID
        const tweet = await twitter.findById(tweetId);
        console.log("Tweet from DB:", tweet);
    
        if (!tweet) {
            throw new ApiError(404, "Tweet not found");
        }
    
        // Check if the tweet belongs to the authenticated user
        if (tweet.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You are not authorized to update this tweet");
        }
    
        // Update the tweet content
        tweet.content = tweetContent.trim();
        await tweet.save();
    
        console.log("Updated Tweet:", tweet);
    
        return res
            .status(200)
            .json(new Apiresponses(200, tweet, "Tweet updated successfully"));
    });
    


// const deletetweet = asynchandler(async (req, res) => {
//     //TODO: delete tweet

//     const { tweetId } = req.params;
//         // const { tweetContent } = req.body;
    
//         console.log("Tweet ID from params:", tweetId);
//         // console.log("New Tweet Content:", tweetContent);
    
//         // Check if tweetId and content are provided
//         if (!tweetId?.trim()) {
//             throw new ApiError(400, "Tweet ID is not provided");
//         }
//         // if (!tweetContent?.trim()) {
//         //     throw new ApiError(400, "New Tweet content can't be empty");
//         // }
    
//         // Find the tweet by ID
//         const tweet = await twitter.findById(tweetId);
//         console.log("Tweet from DB:", tweet);
    
//         if (!tweet) {
//             throw new ApiError(404, "Tweet not found");
//         }
    
//         // Check if the tweet belongs to the authenticated user
//         if (tweet.owner.toString() !== req.user._id.toString()) {
//             throw new ApiError(403, "You are not authorized to delete this tweet");
//         }
    
//         // Delete the tweet
//     await tweet.deleteOne();

//     console.log("Tweet deleted successfully:", tweetId);
    
//         console.log("deleted Tweet:", tweet);
    
//         return res
//             .status(200)
//             .json(new Apiresponses(200, tweet, "Tweet deleted  successfully"));
//     });

const deletetweet = asynchandler(async (req, res) => {
    let { tweetId } = req.params;

    // Sanitize tweetId
    tweetId = tweetId.replace(/^:/, "");  // Remove leading colon, if any
    console.log("Sanitized Tweet ID:", tweetId);

    // Check if tweetId is provided
    if (!tweetId?.trim()) {
        throw new ApiError(400, "Tweet ID is not provided");
    }

    // Find the tweet by ID
    const tweet = await twitter.findById(tweetId);
    console.log("Tweet from DB:", tweet);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // // Check if the tweet belongs to the authenticated user
    // if (tweet.owner.toString() !== req.user._id.toString()) {
    //     throw new ApiError(403, "You are not authorized to delete this tweet");
    // }   

    // Delete the tweet
    const tweetdata = await tweet.deleteOne();

    console.log("Tweet deleted successfully:", tweetdata);

    return res
        .status(200)
        .json(new Apiresponses(200, tweetdata, "Tweet deleted successfully"));
});



export {
    createtweet,
    getUsertweets,
    updatetweet,
    deletetweet
}