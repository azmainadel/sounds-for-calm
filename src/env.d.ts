/// <reference types="astro/client" />

declare module '*.module.css';

interface Navigator {
  audioSession?: {
    type: 'ambient' | 'auto' | 'play-and-record' | 'playback' | 'transient';
  };
}
