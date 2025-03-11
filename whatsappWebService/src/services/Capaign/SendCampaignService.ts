import {WASocket} from "@whiskeysockets/baileys";
import {logger} from "../../utils/logger";

const SendCampaignService = async (
    socket: WASocket,
    message: string,
    groups: string[]
) => {

    const formattedGroups = groups.map(g =>
        g.endsWith('@g.us') ? g : `${g}@g.us`
    );

    logger.info("Attempting to send campaign");

    try{
        for (const g of formattedGroups) {
            await socket.sendMessage(g,{text: message})
        }

        logger.info("Message sended successfully for groups: " + formattedGroups);

        return {
            status: "success"
        }
    } catch (error:any) {
        logger.error(`Error creating group:`, error);
        throw new Error(`Failed to create group: ${error.message}`);
    }
}

export default SendCampaignService;