import {WASocket, delay, AnyMessageContent, GroupMetadata} from "@whiskeysockets/baileys";
import {logger} from "../../utils/logger";
import {AnyRegularMessageContent} from "@whiskeysockets/baileys/lib/Types/Message";
import { readFile } from 'fs/promises';

interface GroupData {
    jid: string,
    subject: string,
    owner: string,
    desc: string,
    announce: false, // Default false
    restrict: false, // Default false
}

const CreateGroupService = async (
    socket: WASocket,
    nameUser: string,
    groupTitle: string,
    groupExpirationDate: string,
    isSingle: boolean,
    participants: string[]
): Promise<GroupData> => {

    const formattedParticipants = participants.map(p =>
        p.endsWith('@s.whatsapp.net') ? p : `${p}@s.whatsapp.net`
    );

    const nameGroup = `${groupTitle}` + ( isSingle ? ` | ${nameUser}` : "" );

    logger.info(`Attempting to create group "${nameGroup}" with participants: ${formattedParticipants}`);

    try {

        const group = await socket.groupCreate(nameGroup, formattedParticipants);
        const descriptionGroup = getDescriptionGroup( groupTitle, groupExpirationDate );

        // Alterar descrição do grupo
        await socket.groupUpdateDescription(
            group.id,
            descriptionGroup
        );

        // Enviar mensagens de boas vindas
        await sendWelcomeMessage(socket, group, nameUser, groupTitle);

        // Change image group
        const {status: statusChangeImage, message: messageChangeImage} = await changeImageGroup( socket, group.id );

        if( statusChangeImage === 'error' )
            logger.error(messageChangeImage);

        logger.info(`Group creation successful: ${group.id}`);

        return {
            jid: group.id,
            subject: group.subject,
            owner: group?.owner || "",
            desc: group?.desc || "",
            announce: false, // Default false
            restrict: false, // Default false
        }
    } catch (error:any) {
        logger.error(`Error creating group:`, error);
        throw new Error(`Failed to create group: ${error.message}`);
    }
};

const sendWelcomeMessage = async (
    socket: WASocket,
    group: GroupMetadata,
    userName: string,
    groupTitle: string
) => {

    await socket.sendMessage(
        group.id,
        {
            text: `🎉 Sejam bem-vindo(a), novo mentorado da turma de *${groupTitle}*🎉`
        }
    );

    await socket.sendMessage(
        group.id,
        getWelcomeMessage(groupTitle)
    );
}

const getWelcomeMessage = ( groupTitle: string ) : AnyRegularMessageContent => {
    return {
        text: `Estamos muito felizes em ter você conosco nessa jornada de aprendizado e crescimento. Este é o começo de um ciclo incrível e estamos prontos para caminhar junto com você rumo ao sucesso! 💪

        Prepare-se para aprender, evoluir e alcançar resultados extraordinários. Vamos juntos! 🚀`
    }
}

const getDescriptionGroup = ( titleGroup : string, expirationDate: string ) => {
    return `*${titleGroup}*
        
        Seja bem vindo à nossa mentoria! 🚀 Nesse grupo você poderá acompanhar todos os comunicados da nossa mentoria e entrar em contato direto com o nosso time de suporte para atender as suas dúvidas!
        
        *Atenção:* Esse grupo deverá ser usado até: ${expirationDate}
    `
}

const changeImageGroup = async ( socket: WASocket, groupId: string ) => {
    try{
        const imageBuffer = await readFile(`${process.cwd()}/public/logo.jpeg`);

        await socket.updateProfilePicture(groupId, imageBuffer);

        return { status: 'success', message: 'Group image updated successfully' };
    }catch(error:any){
        logger.error('Error changing group image:', error);
        return {status: 'error', message: error.message}
    }
}

export default CreateGroupService;