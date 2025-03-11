import AppError from "../../errors/AppError";
import createWhatsappConnection from "../../libs/wbot";

interface Connection {
    id: string,
    status: string,
    session: string,
    qrcode: string,
    retry_count: number;
}

const getSocketService = async (connection: Connection) => {
    try{

        const whatsapp = await createWhatsappConnection(connection);
        return whatsapp.socket;

    }catch (error) {
        throw new AppError("ERR_GET_SOCKET");
    }
}

export default getSocketService;