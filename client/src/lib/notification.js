import { useApp } from 'src/context/AppContext';
import ChatClosedSound from '/notifications/closed.mp3';
import NewMessageSound from '/notifications/new_message.mp3';
import PairedSound from '/notifications/paired.mp3';

/**
 * @typedef {'chatClosed'|'newMessage'|'buddyPaired'} NotificationEvent
 * @typedef {{play: () => Promise<void>}} Sound
 * @typedef {{ volume: number}} NotificationSettings
 */

/**
 * @param {string} soundSrc
 * @param {NotificationSettings} settings
 * @return {Sound}
 */
export function useSound(soundSrc, settings) {
    const _settings = {
        volume: 10,
        ...settings,
    };

    const audio = new Audio(soundSrc);
    audio.preload = 'auto';
    audio.volume = _settings.volume / 100;

    return {
        async play() {
            if (
                !audio.paused &&
                (audio.currentTime / audio.duration) * 100 >= 1
            ) {
                audio.pause();
                audio.currentTime = 0;
            }

            await audio.play();
        },
    };
}

/**
 *
 * @param {NotificationSettings} settings
 */
export function useNotification(settings = {}) {
    const { app } = useApp();
    const { settings: appSettings } = app;

    const _settings = {
        volume: appSettings.notificationsEnabled
            ? appSettings.notificationVolume
            : 0,
        ...settings,
    };

    /** @type {{[event in NotificationEvent]: Sound}} */
    const notifications = {
        chatClosed: useSound(ChatClosedSound, _settings),
        newMessage: useSound(NewMessageSound, _settings),
        buddyPaired: useSound(PairedSound, _settings),
    };

    return {
        /**
         *
         * @param {NotificationEvent} event
         */
        async playNotification(event) {
            if (!notifications[event]) {
                return;
            }

            await notifications[event].play();
        },
    };
}
