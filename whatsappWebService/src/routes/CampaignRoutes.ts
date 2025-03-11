import {Router} from "express";
import * as CampaignController from "../controllers/CampaignController";
import isAuth from "../middleware/isAuth";

const campaignRoutes = Router();

campaignRoutes.post('/send', isAuth, CampaignController.send )

export default campaignRoutes;