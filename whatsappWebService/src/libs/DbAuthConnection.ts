import { AuthenticationCreds, AuthenticationState, initAuthCreds, SignalDataTypeMap } from "@whiskeysockets/baileys";
import { QueryTypes, Sequelize } from "sequelize";
import { logger } from "../utils/logger";
import { proto } from "@whiskeysockets/baileys/WAProto";
import { BufferJSON } from "@whiskeysockets/baileys";
import AppError from "../errors/AppError";

const useDBAuthState = async (sequelize: Sequelize, connectionId: string): Promise<{
    state: AuthenticationState,
    saveCreds: () => Promise<void>
}> => {
    const writeData = async (data: any) => {
        try {
            logger.info("Writing auth data to database");
            const serializedData = JSON.stringify(data, BufferJSON.replacer);
            await sequelize.query(
                'UPDATE connections SET session = :session WHERE id = :id',
                {
                    replacements: {
                        session: serializedData,
                        id: connectionId
                    },
                    type: QueryTypes.UPDATE
                }
            );
        } catch (error) {
            logger.error("Error writing auth data:", error);
            throw new AppError("ERR_WRITING_SESSION_CONNECTION");
        }
    };

    const readData = async () => {
        try {
            logger.info("Reading auth data from database");
            const [result] = await sequelize.query(
                'SELECT session FROM connections WHERE id = :id',
                {
                    replacements: { id: connectionId },
                    type: QueryTypes.SELECT
                }
            );

            if (result && (result as any).session) {
                const parsedData = JSON.parse((result as any).session, BufferJSON.reviver);

                // Convert Buffer-like objects back to Buffers
                if (parsedData.creds) {
                    for (const key in parsedData.creds) {
                        if (parsedData.creds[key] && typeof parsedData.creds[key] === 'object') {
                            if ('type' in parsedData.creds[key] && parsedData.creds[key].type === 'Buffer') {
                                parsedData.creds[key] = Buffer.from(parsedData.creds[key].data);
                            }
                        }
                    }
                }

                logger.info("Successfully read auth data");
                return parsedData;
            }

            logger.info("No existing auth data found");
            return null;
        } catch (error) {
            logger.error("Error reading auth data:", error);
            return null;
        }
    };

    const creds: AuthenticationCreds = (await readData())?.creds || initAuthCreds();

    return {
        state: {
            creds,
            keys: {
                get: async (type: keyof SignalDataTypeMap, ids: string[]) => {
                    const data = await readData();
                    const keys: { [key: string]: any } = {};

                    if (data?.keys?.[type]) {
                        for (const id of ids) {
                            const key = data.keys[type][id];
                            if (key) {
                                keys[id] = key;
                            }
                        }
                    }

                    return keys;
                },
                set: async (data: any) => {
                    const storedData = await readData() || {};
                    storedData.keys = storedData.keys || {};

                    for (const type in data) {
                        storedData.keys[type] = storedData.keys[type] || {};
                        Object.assign(storedData.keys[type], data[type]);
                    }

                    await writeData(storedData);
                }
            }
        },
        saveCreds: async () => {
            try {
                const data = await readData() || {};
                data.creds = creds;
                await writeData(data);
            } catch (error) {
                logger.error("Error saving credentials:", error);
                throw error;
            }
        }
    };
};

export default useDBAuthState;