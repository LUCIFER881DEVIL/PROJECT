import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {Apiresponses} from "../utils/Apiresponses.js"
import {asynchandler} from "../utils/asynchandler.js"

//TODO: get all comments for a video
const getVideoComments = asynchandler(async (req, res) => {
const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asynchandler(async (req, res) => {
    // TODO: add a comment to a video
})

const updateComment = asynchandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asynchandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }