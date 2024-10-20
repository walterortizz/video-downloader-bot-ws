import { SendMessage } from '@/types/socket-type';

export const sendCommandsResponse = async (
  chatId: string,
  sendMessage: SendMessage
) => {
  if (!chatId) return undefined;

  await sendMessage(chatId, {
    text: `
Para buscar vídeos escribe .search seguido de la música/vídeo a buscar. \n
*Por ej*: .search cancion vean de rescate \n
Para elegir ya sea vídeo o audio, selecciona el resultado de la búsqueda y responde con el mensaje de *audio* para obtener el audio, o con *video* para obtener el vídeo         
        `,
  });
};
