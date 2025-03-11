import {WASocket} from "@whiskeysockets/baileys";
import {logger} from "../../utils/logger";

interface Participant {
    number: string,
    name: string
}

interface AddParticipantData {
    status: string,
    message: string
}

const AddParticipantService = async (
    socket: WASocket,
    groupId: string,
    participants: Participant[],
) : Promise<AddParticipantData> => {

    const formattedParticipants = participants.map(p =>
        p.number.endsWith('@s.whatsapp.net') ? p.number : `${p.number}@s.whatsapp.net`
    );

    logger.info(`Attempting to add participants to group "${groupId}" with participants: ${formattedParticipants}`);

    try{

        const inviteCode = await socket.groupInviteCode(groupId);

        if( !inviteCode )
            return {status: "error", message: "Não foi possível obter um link de convite para o grupo"};

        participants.forEach((p, key) => {

            socket.sendMessage(
                formattedParticipants[key],
                {
                    text: `Olá, ${p.name}! Tudo bem? Sejam bem-vindo(a), novo mentorado da nossa turma! 🎉\n\nEstamos muito felizes em ter você conosco nessa jornada de aprendizado e crescimento. Este é o começo de um ciclo incrível e estamos prontos para caminhar junto com você rumo ao sucesso! 💪\n\nPrepare-se para aprender, evoluir e alcançar resultados extraordinários. Vamos juntos! 🚀\n\n Agora basta você clicar no link abaixo e fazer parte do nosso grupo de recados\n\nhttps://chat.whatsapp.com/${inviteCode}`
                }
            )
        });

        return {
            status: "success",
            message: "Participante adicionado com sucesso!"
        }

    }catch (error:any) {
        logger.error(`Error add participants to group:`, error);
        throw new Error(`Failed to add participants to group: ${error.message}`);
    }
}

export default AddParticipantService;