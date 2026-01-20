import Router from "express";
import {
  createComment,
  updateComment,
  deleteComment,
  getAllComments
  
} from "../controllers/comment.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.route("/CreateComments/:videoId").patch(verifyJWT, createComment);
router.route("/updateComments/:commentId").patch(verifyJWT, updateComment); 
router.route("/deleteComments/:commentId").delete(verifyJWT, deleteComment);
router.route("/getAllComments/:commentId").get(verifyJWT, getAllComments);
export default router;
