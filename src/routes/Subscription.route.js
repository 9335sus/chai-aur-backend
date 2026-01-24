import Router from 'express';
import { toggleSubscription,
    getUserChannelsSubscriptions,
    getSubscribedChannels
} from '../controllers/Subscription.controller.js';
import { verifyJWT } from '../middlewares/verifyJWT.middleware.js';
const router=Router();
router.route('/subscribe/:channelId').post(verifyJWT,toggleSubscription);
router.route("/getUserSubscriptions/:channelId").get(verifyJWT,getUserChannelsSubscriptions);
router.route("/getSubscribedChannel/:subscriberId").get(verifyJWT,getSubscribedChannels);
export default router;  