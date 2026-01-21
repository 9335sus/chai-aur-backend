import Router from "express";
import {createPlaylist,
    getUserPlaylists,
    playlistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";
import {verifyJWT} from "../middlewares/verifyJWT.middleware.js";

const router= Router();

router.route("/createPlaylist").post(verifyJWT,createPlaylist);
router.route("/getUserPlaylists").get(verifyJWT,getUserPlaylists);
router.route("/playlistById/:videoId").get(playlistById);
router.route("/addVideoToPlaylist").post(verifyJWT,addVideoToPlaylist);
router.route("/removeVideoFromPlaylist").delete(verifyJWT,removeVideoFromPlaylist);
router.route("/deletePlaylist").delete(verifyJWT,deletePlaylist);
router.route("/updatePlaylist/:playlistId").put(verifyJWT,updatePlaylist);
export default router;