import { Sequelize, QueryTypes } from "sequelize";
import { logger } from "../../utils/logger";

export const setConnectionDeactive = async (sequelize: Sequelize, connectionId: string) => {
    logger.info(`Setting connection ${connectionId} to deactive`);
    await sequelize.query(
        'UPDATE connections SET status = :state, retry_count = 0 WHERE id = :id',
        {
            replacements: {
                state: 'deactive',
                id: connectionId
            },
            type: QueryTypes.UPDATE
        }
    );
};

export const setActiveConnection = async (sequelize: Sequelize, connectionId: string) => {
    logger.info(`Setting connection ${connectionId} to active`);
    await sequelize.query(
        'UPDATE connections SET status = :state, qrcode = NULL, retry_count = 0 WHERE id = :id',
        {
            replacements: {
                state: 'active',
                id: connectionId
            },
            type: QueryTypes.UPDATE
        }
    );
};

export const saveQrCode = async (sequelize: Sequelize, connectionId: string, qrDataUrl: string) => {
    logger.info(`Saving QR code for connection ${connectionId}`);
    await sequelize.query(
        "UPDATE connections SET qrcode = :qrcode WHERE id = :id",
        {
            replacements: {
                qrcode: qrDataUrl,
                id: connectionId
            },
            type: QueryTypes.UPDATE
        }
    );
};

export const incrementRetryConnect = async (sequelize: Sequelize, connectionId: string) => {
    logger.info(`Incrementing retry count for connection ${connectionId}`);
    await sequelize.query(
        "UPDATE connections SET retry_count = retry_count + 1 WHERE id = :id",
        {
            replacements: { id: connectionId },
            type: QueryTypes.UPDATE
        }
    );
};