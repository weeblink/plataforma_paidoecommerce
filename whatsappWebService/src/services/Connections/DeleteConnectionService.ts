import sequelize from "../../database";
import {QueryTypes} from "sequelize";

const DeleteConnectionService = async (connectionId: string) => {
    await sequelize.query(
        'DELETE FROM connections WHERE id = :id',
        {
            replacements: {
                id: connectionId
            },
            type: QueryTypes.DELETE
        }
    );
}

export default DeleteConnectionService;