import mongoose, {isValidObjectId} from "mongoose"
import {like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {Apiresponses} from "../utils/Apiresponses.js"
import {asynchandler} from "../utils/asynchandler.js"

const toggleVideoLike = asynchandler(async (req, res) => {
    const {videoId} = req.params
    console.log("Video ID from params:", videoId)
    //TODO: toggle like on video
    if (!videoId) {
        throw new ApiError(404 , "videoid is required")
    }
    const video = await video.findById(videoId)
    if (!video) {
        throw new ApiError(404 , "videoid not found")
  
    }
    console.log("Video found:", video)
    const isLiked = video.likes.includes(req.user._id);
    console.log("Is video already liked by the user:", isLiked);

    if (isLiked) {
        // Step 3: If already liked, unlike the video
        await video.findByIdAndUpdate(
            videoId,
            { $pull: { likes: req.user._id } },
            { new: true }
        );
        console.log("Video unliked by user:", req.user._id);

        return res
            .status(200)
            .json(new Apiresponses(200, null, "Video unliked successfully"));
    } else {
        // Step 4: If not liked, like the video
        await video.findByIdAndUpdate(
            videoId,
            { $push: { likes: req.user._id } },
            { new: true }
        );
        console.log("Video liked by user:", req.user._id);

        return res
            .status(200)
            .json(new Apiresponses(200, null, "Video liked successfully"));
    }
});

const toggleCommentLike = asynchandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

})

const toggleTweetLike = asynchandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asynchandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}