
import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
// import {user} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
//  import {ApiResponses} from "../utils/Apiresponses.js"
import {asynchandler} from "../utils/asynchandler.js"
import {uploadoncloudinary} from "../utils/cloudinary.js"


const getAllVideos = asynchandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const filters = {};
    if (query) {
        filters.title = { $regex: query, $options: 'i' };
    }
    if (userId) {
        filters.userId = userId;
    }

    const videos = await Video.find(filters)
        .sort({ [sortBy]: sortType === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const total = await Video.countDocuments(filters);

    res.status(200).json({
        success: true,
        total,
        page,
        limit,
        videos,
    });
});

/*
const publishAVideo = asynchandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    const { title, description, userId } = req.body;
    const videoFile = req.file;

    if (!videoFile) {
        return res.status(400).json({ success: false, message: 'No video file uploaded' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(videoFile.path, {
        resource_type: 'video',
        folder: 'videos'
    });

    const newVideo = await Video.create({
        title,
        description,
        videoUrl: result.secure_url,
        thumbnailUrl: result.secure_url.replace('.mp4', '.jpg'),
        userId,
    });

    res.status(201).json({ success: true, video: newVideo });
})

// const getVideoById = asynchandler(async (req, res) => {
//     const { videoId } = req.params
//     //TODO: get video by id
// })

// const updateVideo = asynchandler(async (req, res) => {
//     const { videoId } = req.params
//     //TODO: update video details like title, description, thumbnail

// })

// const deleteVideo = asynchandler(async (req, res) => {
//     const { videoId } = req.params
//     //TODO: delete video
// })

// const togglePublishStatus = asynchandler(async (req, res) => {
//     const { videoId } = req.params
// })


// Get Video by ID
const getVideoById = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);

    if (!video) {
        return res.status(404).json({ success: false, message: 'Video not found' });
    }

    res.status(200).json({ success: true, video });
});

// Update Video Details
const updateVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, thumbnailUrl } = req.body;

    const video = await Video.findById(videoId);
    if (!video) {
        return res.status(404).json({ success: false, message: 'Video not found' });
    }

    video.title = title || video.title;
    video.description = description || video.description;
    video.thumbnailUrl = thumbnailUrl || video.thumbnailUrl;

    await video.save();

    res.status(200).json({ success: true, video });
});

// Delete Video
const deleteVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);

    if (!video) {
        return res.status(404).json({ success: false, message: 'Video not found' });
    }

    await video.remove();
    res.status(200).json({ success: true, message: 'Video deleted successfully' });
});

// Toggle Publish Status
const togglePublishStatus = asynchandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);

    if (!video) {
        return res.status(404).json({ success: false, message: 'Video not found' });
    }

    video.isPublished = !video.isPublished;
    await video.save();

    res.status(200).json({ success: true, isPublished: video.isPublished });
});

*/
export {
    getAllVideos,
    // publishAVideo,
    // getVideoById,
    // updateVideo,
    // deleteVideo,
    // togglePublishStatus
}

