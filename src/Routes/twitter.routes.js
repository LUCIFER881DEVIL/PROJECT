import { Router } from 'express';
import {
    createtweet,
    deletetweet,
    getUsertweets,
    updatetweet,
} from "../controllers/twitter.controller.js"
import {verifyJWT} from "../Middlewares/auth.middlewares.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createtweet);
router.route("/Email/:Email").get(getUsertweets);
router.route("/:tweetId").patch(updatetweet).delete(deletetweet);

export default router