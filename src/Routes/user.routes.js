import { Router} from "express";
import registeration from "../controllers/user.controller.js";

const router = Router()
router.route("/register").post(registeration)

export default router