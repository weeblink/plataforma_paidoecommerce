import {makeWASocket, WASocket} from '@whiskeysockets/baileys';
import { logger } from "../../utils/logger";
import useDBAuthState from "../../libs/DbAuthConnection";
import sequelize from "../../database";
import {setActiveConnection, setConnectionDeactive} from "./ConnectionStateService";

interface Connection {
    id: string,
    status: string,
    session: string,
    qrcode: string,
    retry_count: number;
}

export async function getExistingSocket(connection: Connection): Promise<WASocket> {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Connection timeout'));
        }, 60000);

        const connect = async () => {
            try {
                const { state, saveCreds } = await useDBAuthState(sequelize, connection.id);

                const sock = makeWASocket({
                    auth: state,
                    fireInitQueries: false
                });

                let initComplete = false;

                sock.ev.on('connection.update', async (update) => {
                    const { connection: status, lastDisconnect } = update;
                    logger.info(`Connection status: ${status}`);

                    if (status === 'open' && !initComplete) {
                        try {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            initComplete = true;
                            clearTimeout(timeout);

                            await setActiveConnection(sequelize, connection.id);
                            resolve(sock);

                        } catch (error) {
                            logger.error('Init error:', error);
                            reject(error);
                        }
                    }

                    if (status === 'close') {
                        clearTimeout(timeout);
                        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
                        reject(new Error(`Connection closed: ${statusCode}`));
                    }
                });

                sock.ev.on('creds.update', saveCreds);

            } catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        };

        connect().catch(reject);
    });
}