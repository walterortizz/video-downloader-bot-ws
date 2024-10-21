import ytSearch from 'yt-search';
import { SendMessage } from '../types/socket-type';
import { formatNumberWithDots, formatTime } from '../utils/index';

export const searchVideoAndResponse = async (
  query: string,
  userId: string,
  sendMessage: SendMessage
) => {
  try {
    if (!query) return;
    const res = await ytSearch(query);
    const [video] = res.videos;
    if (!video)
      return await sendMessage(userId, {
        text: 'No se ha encontrado ningún vídeo.',
      });
    else
      return await sendMessage(userId, {
        image: {
          url: video.image,
        },
        caption: `
◉ *Título*: ${video.title} \n
◉ *Duración*: ${formatTime(video.duration?.seconds)} \n
◉ *Publicado*: ${video.ago} \n
◉ *Autor*: ${video.author?.name} \n
◉ *Vistas*: ${formatNumberWithDots(video.views)} \n
◉ *ID*: ${video.videoId}
`,
      });
  } catch (error) {
    console.log(error);
  }
};
