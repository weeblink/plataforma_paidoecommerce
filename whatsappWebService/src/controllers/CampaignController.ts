import {Request, Response} from "express";
import { z } from 'zod';
import {logger} from "../utils/logger";
import ClearExistingSession from "../services/Connections/ClearConnectionSession";
import getDefaultConnectionService from "../services/Connections/GetDefaultConnectionService";
import {getExistingSocket} from "../services/Connections/GetExistingConnection";
import createGroupService from "../services/Groups/CreateGroupService";
import SendCampaignService from "../services/Capaign/SendCampaignService";

const CampaignGroup = z.object({
    message: z.string().min(1),
    groups: z.array(
        z.string().regex(/^\d+@g\.us$/)
    ).min(1),
})

export const send = async (req: Request, res: Response) => {

    let connectionId = null;

    try{

        const validatedData = await CampaignGroup.parseAsync(req.body);

        const { statusConnection, connection } = await getDefaultConnectionService();

        if (!connection || statusConnection !== 'success') {
            res.status(404).json({
                status: 'error',
                error: "No active WhatsApp connection found"
            });
            return;
        }

        connectionId = connection.id;

        const socket = await getExistingSocket(connection);

        await SendCampaignService(
            socket,
            validatedData.message,
            validatedData.groups
        );

        res.status(200).json({
            status: 'success',
        });

    }catch(error:any){
        logger.error(`Error in campaign controller:`, error);

        // Handle session conflicts
        if (error.message?.includes('conflict') && connectionId) {
            await ClearExistingSession(connectionId);
            res.status(409).json({
                status: 'error',
                error: 'WhatsApp session expired. Please scan QR code again.'
            });
            return;
        }

        // Handle validation errors
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                error: error.errors
            });
            return;
        }

        // Handle timeouts
        if (error.message?.includes('timeout')) {
            res.status(504).json({
                status: 'error',
                error: 'Request timed out'
            });
            return;
        }

        // Handle other errors
        res.status(500).json({
            status: 'error',
            error: error.message || 'Unknown error occurred'
        });
    }
};