import sequelize from "../../database";
import {QueryTypes} from "sequelize";

const ClearExistingSession  = async (connectionId: string) => {
    await sequelize.query(
        'UPDATE connections SET session = NULL, status = :status WHERE id = :id',
        {
            replacements: {
                status: 'deactive',
                id: connectionId
            },
            type: QueryTypes.UPDATE
        }
    );
}

export default ClearExistingSession;