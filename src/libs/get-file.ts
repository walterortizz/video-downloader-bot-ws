import { formatTime } from '../utils/index';
import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import dotenv from 'dotenv';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { v4 } from 'uuid';
ffmpeg.setFfmpegPath(ffmpegPath);

dotenv.config();
const cookies = JSON.parse(process.env.YTDL_COOKIES as string);

const agent = ytdl.createAgent(cookies);
export const getVideoFile = async (url: string) => {
  try {
    const id = v4();
    const output = join(__dirname, '../../', 'tmp/video', `${id}.mp4`);
    const videoInfoPromise = ytdl.getInfo(url, { agent });
    const videoPath: string = await new Promise((resolve, reject) => {
      ytdl(url, { agent, filter: 'audioandvideo', quality: 'lowest' })
        .pipe(createWriteStream(output))
        .on('close', () => resolve(output))
        .on('error', () => reject(undefined));
    });

    const videoInfo = await videoInfoPromise;
    return {
      videoPath,
      title: videoInfo.videoDetails.title,
      duration: formatTime(
        parseFloat(videoInfo?.videoDetails?.lengthSeconds ?? '0')
      ),
    };
  } catch (error) {
    return {
      videoPath: undefined,
      title: undefined,
      duration: undefined,
    };
  }
};

export const getAudioFile = async (url: string) => {
  try {
    const id = v4();
    const output = join(__dirname, '../../', 'tmp/audio', `${id}.mp3`);
    const audioPath: string = await new Promise((resolve, reject) => {
      const stream = ytdl(url, {
        agent,
        filter: 'audioonly',
        quality: 'lowest',
      });
      ffmpeg()
        .input(stream)
        .audioCodec('libmp3lame')
        .format('mp3')
        .on('error', (err) => reject(err))
        .pipe(createWriteStream(output))
        .on('close', () => resolve(output))
        .on('error', () => reject(undefined));
    });

    return audioPath;
  } catch (error) {
    return undefined;
  }
};
