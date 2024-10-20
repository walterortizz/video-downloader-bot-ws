import {
  makeWASocket,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  DisconnectReason,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import { searchVideoAndResponse } from './commands/search-video';
import { sendVideoResponse } from './commands/send-video';
import { sendAudioResponse } from './commands/send-audio';
import { sendCommandsResponse } from './commands/how-use';
const logger = pino({ level: 'silent' }) as any;

const processedMessages = new Set();

setInterval(() => {
  processedMessages.clear();
}, 60000);

const startSock = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`);

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: true,
    auth: state,
    generateHighQualityLinkPreview: true,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      if (
        (lastDisconnect?.error as any)?.output?.statusCode !==
        DisconnectReason.loggedOut
      ) {
        startSock();
      }
    }
  });

  sock.ev.process(async (events: any) => {
    if (events['creds.update']) {
      await saveCreds();
    }

    sock.ev.on('messages.upsert', async (data) => {
      const [chat] = data.messages;
      const shouldSkip =
        chat.key.fromMe ||
        processedMessages.has(chat.key.id) ||
        data.type != 'notify' ||
        !chat.key?.remoteJid;

      if (shouldSkip) return;
      processedMessages.add(chat.key.id);

      const message = chat.message;

      if (message?.conversation?.startsWith('.info')) {
        await sendCommandsResponse(chat.key?.remoteJid ?? '', sock.sendMessage);
      } else if (message?.conversation?.startsWith('.search')) {
        const query = message.conversation.split('.search')[1];
        await searchVideoAndResponse(
          query,
          chat.key?.remoteJid ?? '',
          sock.sendMessage
        );
      } else if (message?.extendedTextMessage?.text?.startsWith('video')) {
        const caption =
          message.extendedTextMessage.contextInfo?.quotedMessage?.imageMessage
            ?.caption;
        const videoId = caption?.split(':').reverse()[0]?.trim();
        await sendVideoResponse(chat.key, sock.sendMessage, videoId);
      } else if (message?.extendedTextMessage?.text?.startsWith('audio')) {
        const caption =
          message.extendedTextMessage.contextInfo?.quotedMessage?.imageMessage
            ?.caption;
        const videoId = caption?.split(':').reverse()[0]?.trim();
        await sendAudioResponse(chat.key, sock.sendMessage, videoId);
      }
    });
  });

  return sock;
};

startSock();
