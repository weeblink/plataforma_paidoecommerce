import {logger} from "../../utils/logger";
import AppError from "../../errors/AppError";
import sequelize from "../../database";
import {QueryTypes} from "sequelize";

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

const GetDefaultConnectionService = async (  ) : Promise<ConnectionResponse> => {
    try{

        const connections = await sequelize.query<Connection>(
            "SELECT * FROM connections LIMIT 1",
            {
                type: QueryTypes.SELECT
            }
        )

        if( !connections || connections.length === 0 ){
            return {
                statusConnection: 'error',
                connection: null,
            }
        }

        /*if( !connections[0]?.session )
            throw new Error("NO_ACTIVE_SESSION");*/

        return {
            statusConnection: 'success',
            connection: connections[0],
        }

    }catch(err:any){
        logger.error(err);
        throw new AppError("ERROR_FIND_DEFAULT_CONNECTION");
    }
}

export default GetDefaultConnectionService;