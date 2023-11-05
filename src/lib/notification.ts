import { useApp } from '@/context/AppContext';

import ChatClosedSound from '/notifications/closed.mp3';
import NewMessageSound from '/notifications/new_message.mp3';
import PairedSound from '/notifications/paired.mp3';
import { SettingsType } from '@/types/types';

/**
 * @typedef {'chatClosed'|'newMessage'|'buddyPaired'} NotificationEvent
 * @typedef {{play: () => Promise<void>}} Sound
 * @typedef {{ volume: number}} NotificationSettings
 */

export function useSound(soundSrc: string, settings: SettingsType) {
  const _settings = {
    ...settings,
  };

  _settings.notificationVolume = 10;

  const audio = new Audio(soundSrc);
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

export function useNotification(settings: any) {
  const { app } = useApp();
  const { settings: appSettings } = app;

  const _settings = {
    ...settings,
  };

  _settings.notificationVolume = appSettings.notificationsEnabled
    ? appSettings.notificationVolume
    : 0;

  const notifications = {
    chatClosed: useSound(ChatClosedSound, _settings),
    newMessage: useSound(NewMessageSound, _settings),
    buddyPaired: useSound(PairedSound, _settings),
  };

  return {
    async playNotification(event: string) {
      const keys = Object.keys(notifications);
      const value =
        notifications[
          keys.find(k => k === event) as keyof typeof notifications
        ];

      if (!value) {
        return;
      }

      await value.play();
    },
  };
}
