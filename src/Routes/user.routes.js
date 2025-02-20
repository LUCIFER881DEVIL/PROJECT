import { Router} from "express";
import registeration from "../controllers/user.controller.js";
import {upload} from "../Middlewares/multer.midd.js"
const router = Router()
router.route("/register").post(
    upload.fields([
        {
            name:"Avatar",
            maxCount:2
        },
        {
            name:"CoverImage",
            maxCount: 2
        }
    ]),
    registeration)

export default router