import {Router} from "express";
import isAuth from "../middleware/isAuth";
import * as GroupController from "../controllers/GroupsController";
import {addParticipant} from "../controllers/GroupsController";

const groupsRoutes = Router();

groupsRoutes.post('/create', isAuth, GroupController.createGroup);
groupsRoutes.post('/add-participants', isAuth, GroupController.addParticipant)

export default groupsRoutes;