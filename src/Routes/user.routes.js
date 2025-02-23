import { Router} from "express";
import {loginuser, 
    logoutuser,
     registeration,
      refreshaccesstoken, 
      changecurrentpassword, 
      getCurrentUser, 
      updateaccountinfo, 
      updateavatarinfo, 
      updatcoverimageinfo, 
      getuserchannelprofile,
       getuserwatchhistory} from "../controllers/user.controller.js";
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
router.route("/chanepassword").post(verifyJWT,changecurrentpassword)
router.route("/getcurrentuser").get(verifyJWT ,getCurrentUser)
router.route("/updateaccountdetails").patch(verifyJWT ,updateaccountinfo)
router.route("/updateavatar").patch(verifyJWT ,upload.single("avatar"),updateavatarinfo)
router.route("/updatecoverimage").patch(verifyJWT ,upload.single("coverimage"),updatcoverimageinfo)

router.route("/c/:username").get(verifyJWT , getuserchannelprofile)
router.route("/history").get(verifyJWT ,getuserwatchhistory)
export default router