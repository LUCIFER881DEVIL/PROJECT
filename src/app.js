import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app =express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials : true
}))
app.use(express.json({ limit : "20kb"}))
app.use(express.urlencoded({ extended: true , limit:"20kb"}))
app.use(express.static("public"))
app.use(cookieParser())



// IMPORITNG ROUTES 
import userRouter from "./Routes/user.routes.js"
import healthcheckrouter from "./Routes/healthcheck.routes.js"
import twitterrouter from "./Routes/twitter.routes.js"
// import subscriptionRouter from "./Routes/subscription.routes.js"
import videoRouter from "./Routes/video.routes.js"
// import commentRouter from "./Routes/comment.routes.js"
// import likeRouter from "./Routes/like.routes.js"
// import playlistRouter from "./Routes/playlist.routes.js"
// import dashboardRouter from "./Routes/dashboard.routes.js"


// ROUTES DECLARATION
app.use("/api/v1/users",userRouter)
app.use("/api/v1/healthcheck", healthcheckrouter)
app.use("/api/v1/tweets", twitterrouter)
// app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
// app.use("/api/v1/comments", commentRouter)
// app.use("/api/v1/likes", likeRouter)
// app.use("/api/v1/playlist", playlistRouter)
// app.use("/api/v1/dashboard", dashboardRouter)


export {app}