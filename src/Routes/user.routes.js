import { Router} from "express";
import {loginuser, logoutuser, registeration, refreshaccesstoken} from "../controllers/user.controller.js";
import {upload} from "../Middlewares/multer.midd.js";
import { verifyJWT } from "../Middlewares/auth.middlewares.js";
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

router.route("/login").post(loginuser)

router.route("/logout").post(verifyJWT, logoutuser)
router.route("/refreshtoken").post(refreshaccesstoken)


export default router