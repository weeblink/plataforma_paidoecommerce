import { Router } from "express";
import * as ConnectionController from "../controllers/ConnectionController";
import isAuth from "../middleware/isAuth";

const connectionRoutes = Router();

connectionRoutes.post('/:connection_id/create-qrcode', isAuth, ConnectionController.createQrCode);
connectionRoutes.delete('/:connection_id/remove', isAuth, ConnectionController.removeConnection)

export default connectionRoutes;