import {
    ConnectionState,
    makeWASocket,
    WASocket,
    fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode';
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import { Boom } from '@hapi/boom';
import useDBAuthState from "./DbAuthConnection";
import {
    setConnectionDeactive,
    setActiveConnection,
    saveQrCode,
    incrementRetryConnect
} from "../services/Connections/ConnectionStateService";
import sequelize from "../database";
import {QueryTypes} from "sequelize";

interface Connection {
    id: string;
    status: string;
    session: string;
    qrcode: string;
    retry_count: number;
}

interface WhatsAppConnection {
    socket: WASocket;
    getQRCode: () => Promise<string>;
}

// ... previous imports ...

async function createWhatsappConnection(
    connectionData: Connection,
    retryCount = 0
): Promise<WhatsAppConnection> {
    logger.info(`[DEV] Starting connection for ID: ${connectionData.id} (Attempt ${retryCount + 1})`);

    const MAX_RETRIES = 3;
    const RESTART_DELAY = 3000;

    try {
        // Reset connection state only on first attempt
        if (retryCount === 0) {
            await setConnectionDeactive(sequelize, connectionData.id);
        }

        const { state, saveCreds } = await useDBAuthState(sequelize, connectionData.id);

        let qrCodeResolve: ((value: string) => void) | null = null;
        let qrCodeReject: ((reason: any) => void) | null = null;
        let isConnectionSuccessful = false;
        let hasQRCode = false;

        const qrCodePromise = new Promise<string>((resolve, reject) => {
            qrCodeResolve = resolve;
            qrCodeReject = reject;

            setTimeout(() => {
                if (!hasQRCode && !isConnectionSuccessful) {
                    reject(new AppError('QR_CODE_GENERATION_TIMEOUT'));
                }
            }, 29000);
        });

        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            browser: ["Edge (Windows)", "Edge", "22.04.4"], // Changed browser signature
            version: [2, 2434, 12],
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000,
            emitOwnEvents: true,
            markOnlineOnConnect: false,
            logger: logger as any,
            getMessage: async () => undefined
        });

        // Handle connection updates
        sock.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
            try {
                const { connection, lastDisconnect, qr } = update;
                logger.info(`[DEV] Connection update for ${connectionData.id}:`, update);

                if (qr && !isConnectionSuccessful) {
                    try {
                        logger.info(`[DEV] New QR code received`);
                        const qrDataURL = await qrcode.toDataURL(qr);
                        await saveQrCode(sequelize, connectionData.id, qrDataURL);
                        hasQRCode = true;
                        if (qrCodeResolve) {
                            qrCodeResolve(qrDataURL);
                        }
                    } catch (error) {
                        logger.error(`[DEV] Error processing QR code:`, error);
                        if (qrCodeReject) {
                            qrCodeReject(new AppError("ERROR_GET_QRCODE_CONNECTION"));
                        }
                    }
                }

                if (connection === 'open') {
                    logger.info(`[DEV] Connection opened successfully`);
                    isConnectionSuccessful = true;
                    await setActiveConnection(sequelize, connectionData.id);
                    await saveCreds();
                }

                if (connection === 'close' && !isConnectionSuccessful) {
                    const error = lastDisconnect?.error as Boom;
                    const statusCode = (error?.output?.statusCode || 0);
                    logger.error(`[DEV] Connection closed with status: ${statusCode}`);

                    if (retryCount >= MAX_RETRIES) {
                        logger.error(`[DEV] Max retries reached`);
                        await setConnectionDeactive(sequelize, connectionData.id);
                        if (qrCodeReject) {
                            qrCodeReject(new AppError('MAX_RETRIES_REACHED'));
                        }
                        return;
                    }

                    logger.info(`[DEV] Attempting reconnect after delay...`);
                    await new Promise(resolve => setTimeout(resolve, RESTART_DELAY));
                    await incrementRetryConnect(sequelize, connectionData.id);

                    await createWhatsappConnection(
                        { ...connectionData, retry_count: retryCount + 1 },
                        retryCount + 1
                    );
                }
            } catch (error) {
                logger.error(`[DEV] Error in connection update handler:`, error);
                if (qrCodeReject && !isConnectionSuccessful) {
                    qrCodeReject(new AppError('CONNECTION_ERROR'));
                }
            }
        });

        // Handle credential updates
        sock.ev.on('creds.update', async () => {
            try {
                logger.info(`[DEV] Updating credentials`);
                await saveCreds();
            } catch (error) {
                logger.error(`[DEV] Error updating credentials:`, error);
            }
        });

        return {
            socket: sock,
            async getQRCode(): Promise<string> {
                try {
                    logger.info(`[DEV] Waiting for QR code`);
                    return await qrCodePromise;
                } catch (error) {
                    logger.info("SEGUROU ERROR NO REJECT")
                    logger.error(`[DEV] QR code error:`, error);
                    throw new AppError(`Failed to get QR code: ${(error as Error).message}`);
                }
            }
        };
    } catch (error) {
        logger.error(`[DEV] Fatal connection error:`, error);
        await setConnectionDeactive(sequelize, connectionData.id);
        throw error;
    }
}

export default createWhatsappConnection;