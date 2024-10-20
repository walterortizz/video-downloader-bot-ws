import { getVideoFile } from '@/libs/get-file';
import { SendMessage } from '@/types/socket-type';
import { proto } from '@whiskeysockets/baileys';
import { unlink } from 'fs';

export const sendVideoResponse = async (
  messageKey: proto.IMessageKey,
  sendMessage: SendMessage,
  videoId?: string
) => {
  if (!videoId || !messageKey.remoteJid) return undefined;

  sendMessage(messageKey.remoteJid, {
    react: {
      text: '⌛',
      key: messageKey,
    },
  });
  const { videoPath, title, duration } = await getVideoFile(
    `https://www.youtube.com/watch?v=${videoId}`
  );

  try {
    if (!videoPath) throw new Error('video url not found');
    await sendMessage(messageKey.remoteJid, {
      video: {
        url: videoPath,
      },
      mimetype: 'video/mp4',
      fileName: `${videoId}.mp4`,
      caption: `
◉ *Título*: ${title}\n
◉ *Duración*: ${duration} \n
`,
    });
    sendMessage(messageKey.remoteJid, {
      react: {
        text: '✅',
        key: messageKey,
      },
    });
  } catch (error) {
    sendMessage(messageKey.remoteJid, {
      react: {
        text: '❌',
        key: messageKey,
      },
    });
    console.log(error);
  } finally {
    if (videoPath) unlink(videoPath, () => {});
  }
};
