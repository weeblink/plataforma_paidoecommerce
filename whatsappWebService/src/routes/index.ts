import { Router } from "express";
import connectionRoutes from "./ConnectionRoutes";
import groupsRoutes from "./GroupsRoutes";
import campaignRoutes from "./CampaignRoutes";

const routes = Router();

routes.use('/connection',connectionRoutes);
routes.use('/groups', groupsRoutes);
routes.use('/campaign', campaignRoutes);

export default routes;