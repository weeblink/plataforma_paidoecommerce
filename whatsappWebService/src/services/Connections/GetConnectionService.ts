import AppError from "../../errors/AppError";
import sequelize from "../../database";
import {Sequelize, QueryTypes} from "sequelize";
import {logger} from "../../utils/logger";

interface Connection {
    id: string,
    status: string,
    session: string,
    qrcode: string,
    retry_count: number;
}

interface ConnectionResponse {
    statusConnection: 'success' | 'error';
    connection: Connection | null;
}

const GetConnectionService = async ( connectionId: string ) : Promise<ConnectionResponse> => {

    try{
        const [connection] = await sequelize.query<Connection>(
            "SELECT * FROM connections WHERE id = :connection_id",
            {
                replacements: { connection_id: connectionId },
                type: QueryTypes.SELECT,
            }
        );

        if (!connection) {
            return {
                statusConnection: 'error',
                connection: null
            };
        }

        return {
            statusConnection: 'success',
            connection
        };
    }catch(error){
        logger.error(error);
        throw new AppError("ERROR_FIND_CONNECTION");
    }
}

export default GetConnectionService;