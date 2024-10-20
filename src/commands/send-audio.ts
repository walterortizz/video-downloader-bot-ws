import { getAudioFile } from '@/libs/get-file';
import { SendMessage } from '@/types/socket-type';
import { proto } from '@whiskeysockets/baileys';
import { unlink } from 'fs';

export const sendAudioResponse = async (
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
  const audioPath = await getAudioFile(
    `https://www.youtube.com/watch?v=${videoId}`
  );

  try {
    if (!audioPath) throw new Error('audio path not found');
    await sendMessage(messageKey.remoteJid, {
      audio: {
        url: audioPath as string,
      },
      mimetype: 'audio/mpeg',
      fileName: `${videoId}.mp3`,
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
    if (audioPath) unlink(audioPath, () => {});
  }
};
