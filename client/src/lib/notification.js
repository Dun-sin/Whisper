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
    /** @type {{[event in NotificationEvent]: Sound}} */
    const notifications = {
        chatClosed: useSound(ChatClosedSound, settings),
        newMessage: useSound(NewMessageSound, settings),
        buddyPaired: useSound(PairedSound, settings),
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
