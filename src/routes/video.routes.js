import Router from "express";
import {
  getAllVideo,
  publishVideo,
  getvideoById,
  updateVideo,
  deleteVideo
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();
// router.use(verifyJWT);

router.route("/getAllVideo").get(getAllVideo);
router.route("/publishVideo").post(
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishVideo
);
router.route("/getVideoById/:videoId").get(getvideoById);
router.route("/updateVideo/:videoId").put(verifyJWT,upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),updateVideo);
  router.route("/deleteVideo/:videoId").delete(verifyJWT,deleteVideo);
export default router;
