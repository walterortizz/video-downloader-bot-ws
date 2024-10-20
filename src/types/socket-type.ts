import {
  AnyMessageContent,
  MiscMessageGenerationOptions,
  proto,
} from '@whiskeysockets/baileys';

export type SendMessage = (
  jid: string,
  content: AnyMessageContent,
  options?: MiscMessageGenerationOptions
) => Promise<proto.WebMessageInfo | undefined>;
