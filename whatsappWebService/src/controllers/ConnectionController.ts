import { Request, Response } from "express";
import getConnectionService from "../services/Connections/GetConnectionService";
import { logger } from "../utils/logger";
import createWhatsappConnection from "../libs/wbot";
import {getExistingSocket} from "../services/Connections/GetExistingConnection";
import DeleteConnectionService from "../services/Connections/DeleteConnectionService";

export const createQrCode = async (req: Request, res: Response): Promise<void> => {
    const { connection_id } = req.params;

    try {
        const { statusConnection, connection } = await getConnectionService(connection_id);

        if (statusConnection !== 'success' || !connection) {
            res.status(404).json({
                status: 'error',
                error: "Connection not found"
            });
            return;
        }

        const connectionData = {
            id: connection.id,
            status: connection.status,
            session: connection.session,
            qrcode: connection.qrcode,
            retry_count: connection.retry_count
        };

        logger.info(`Creating WhatsApp connection for ID: ${connection_id}`);

        // Add timeout for QR code generation
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('QR code generation timeout')), 60000);
        });

        const wbot = await createWhatsappConnection(connectionData);
        const qrCode = await Promise.race([
            wbot.getQRCode(),
            timeoutPromise
        ]);

        res.status(200).json({
            status: 'success',
            qrcode: qrCode
        });

    } catch (error: any) {
        logger.error("TEST");
        logger.error(`Error creating QR code for connection ${connection_id}:`, error);

        const errorMessage = error.message || 'Unknown error occurred';
        const statusCode = error.message.includes('timeout') ? 504 : 500;

        res.status(statusCode).json({
            status: 'error',
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const removeConnection = async ( req: Request, res: Response ) : Promise<void> => {
    const { connection_id } = req.params;

    try{

        const { statusConnection, connection } = await getConnectionService(connection_id);

        if (statusConnection !== 'success' || !connection) {
            res.status(404).json({
                status: 'error',
                error: "Connection not found"
            });
            return;
        }

        const socket = await getExistingSocket(connection);

        await socket.logout();

        if (socket.ws) {
            socket.ws.close();
        }

        await DeleteConnectionService( connection.id );

        res.status(200).json({
            status: "success",
            message: "Connection removed successfully",
        });

    }catch (error:any){
        logger.error(`Error remove connection ${connection_id}:`, error);

        const errorMessage = error.message || 'Unknown error occurred';
        const statusCode = error.message.includes('timeout') ? 504 : 500;

        res.status(statusCode).json({
            status: 'error',
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}