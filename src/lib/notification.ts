import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import ChatClosedSound from '../../public/notifications/closed.mp3';
import NewMessageSound from '../../public/notifications/new_message.mp3';
import PairedSound from '../../public/notifications/paired.mp3';
import { SettingsType } from '@/types/types';

/**
 * @typedef {'chatClosed'|'newMessage'|'buddyPaired'} NotificationEvent
 * @typedef {{play: () => Promise<void>}} Sound
 * @typedef {{ volume: number}} NotificationSettings
 */

type AudioSettings = {
  notificationVolume: number;
};

type UseSoundReturnType = {
  play: () => Promise<void>;
};

type UseSoundProps = {
  audio: HTMLAudioElement | null;
  settings: SettingsType;
};

type UseNotificationReturnType = {
  playNotification: (event: string) => Promise<void>;
};

type UseNotificationProps = {
  settings: any;
};

export function useNotification({
  settings,
}: UseNotificationProps): UseNotificationReturnType | null {
  const { app } = useApp();
  const { settings: appSettings } = app;

  const _settings = {
    ...settings,
  };

  _settings.notificationVolume = appSettings.notificationsEnabled
    ? appSettings.notificationVolume
    : 0;

  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const setAudioState = (event: string) => {
    let audio;
    switch (event) {
      case 'chatClosed':
        audio = ChatClosedSound;
        break;
      case 'newMessage':
        audio = NewMessageSound;
        break;
      case 'buddyPaired':
        audio = PairedSound;
      default:
        audio = ChatClosedSound;
        break;
    }
    return audio;
  };

  useEffect(() => {
    SoundFuc({ audio, settings: _settings });
  }, [audio]);

  return {
    async playNotification(event: string) {
      setAudio(new Audio(setAudioState(event)));
    },
  };
}

// Modify useSound to accept an existing audio object
export function SoundFuc({
  audio,
  settings,
}: UseSoundProps): UseSoundReturnType {
  const _settings: AudioSettings = {
    ...settings,
  };

  _settings.notificationVolume = 10;

  if (!audio) {
    return {
      play: async () => {},
    };
  }

  audio.preload = 'auto';
  audio.volume = _settings.notificationVolume / 100;

  return {
    async play() {
      if (!audio.paused && (audio.currentTime / audio.duration) * 100 >= 1) {
        audio.pause();
        audio.currentTime = 0;
      }

      await audio.play();
    },
  };
}
