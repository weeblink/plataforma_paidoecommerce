import { Request, Response } from "express";
import { logger } from "../utils/logger";
import getDefaultConnectionService from "../services/Connections/GetDefaultConnectionService";
import createWhatsappConnection from "../libs/wbot";
import createGroupService from "../services/Groups/CreateGroupService";
import ClearExistingSession from "../services/Connections/ClearConnectionSession";
import { z } from 'zod';
import {getExistingSocket} from "../services/Connections/GetExistingConnection";
import {req} from "@sentry/node/build/types/proxy/helpers";
import AddParticipantService from "../services/Groups/AddParticipantService";

const CreateGroupSchema = z.object({
    nameUser: z.string().min(1).max(100),
    participants: z.array(z.string().regex(/^\d{8,15}$/)).min(1),
    groupTitle: z.string().min(1),
    groupExpirationDate: z.string().min(1),
    isSingle: z.boolean()
});

export const createGroup = async (req: Request, res: Response): Promise<void> => {
    let connectionId = null;

    try {
        // Validate input data
        const validatedData = await CreateGroupSchema.parseAsync(req.body);

        // Get default connection
        const { statusConnection, connection } = await getDefaultConnectionService();

        if (!connection || statusConnection !== 'success') {
            res.status(404).json({
                status: 'error',
                error: "No active WhatsApp connection found"
            });
            return;
        }

        connectionId = connection.id;

        // Initialize WhatsApp connection
        const socket = await getExistingSocket(connection);

        // Create group with validated data
        const groupData = await createGroupService(
            socket,
            validatedData.nameUser,
            validatedData.groupTitle,
            validatedData.groupExpirationDate,
            validatedData.isSingle,
            validatedData.participants.map(p => p.replace(/[^\d]/g, '')) // Clean phone numbers
        );

        res.status(200).json({
            status: 'success',
            data: groupData
        });

    } catch (error: any) {
        logger.error(`Error in createGroup controller:`, error);

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

const ParticipantSchema = z.object({
    number: z.string().regex(/^\d{8,15}$/),
    name: z.string()
});

const AddParticipantSchema = z.object({
    group_id: z.string().min(1),
    participants: z.array(ParticipantSchema).min(1),
})

export const addParticipant = async (req: Request, res: Response): Promise<void> =>  {

    let connectionId = null;

    try{
        const validatedData = await AddParticipantSchema.parseAsync(req.body);

        const {statusConnection, connection} = await getDefaultConnectionService();

        if (!connection || statusConnection !== 'success') {
            res.status(404).json({
                status: 'error',
                error: "No active WhatsApp connection found"
            });
            return;
        }

        connectionId = connection.id;

        // Initialize WhatsApp connection
        const socket = await getExistingSocket(connection);

        await AddParticipantService(
            socket,
            validatedData.group_id,
            validatedData.participants
        );

        res.status(200).json({
            status: 'success'
        });

    }catch(error:any){
        logger.error(`Error in createGroup controller:`, error);

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
}
