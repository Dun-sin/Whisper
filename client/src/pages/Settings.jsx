import { useMemo } from 'react';
import {
    Animation,
    Button,
    ButtonToolbar,
    Checkbox,
    Divider,
    Form,
    Message,
    Slider,
    Toggle
} from 'rsuite';

import { useApp } from 'src/context/AppContext';
import useAppTheme from 'src/hooks/useAppTheme';

const Searching = () => {
    const { setLightTheme, setDarkTheme } = useAppTheme()
    const {
        app,
        hasUnsavedSettings,
        updateSettings,
        updateTmpSettings,
        cancelSettingsUpdate,
    } = useApp();
    const settings = useMemo(() => {
        return app.tmpSettings
            ? { ...app.settings, ...app.tmpSettings }
            : app.settings;
    });

    /**
     *
     * @param {Event | SubmitEvent} e
     */
    const handleSubmit = () => {
        updateSettings();
        if (settings.theme) { setDarkTheme() }
        else { setLightTheme() }
    };

    const handleChange = (newSettings) => {
        updateTmpSettings(newSettings);
    };

    return (
        <div
            className="flex justify-center items-center flex-col min-w-[calc(100%-120px)] p-2 gap-5 bg-primary min-h-full"
        >
            <Form onSubmit={handleSubmit} onChange={handleChange}>
                <Divider className="text-white">Notifications</Divider>
                <Form.Group controlId="notifications-enabled">
                    <Form.Control
                        name="notificationsEnabled"
                        accepter={Checkbox}
                        checked={settings.notificationsEnabled}
                        value={!settings.notificationsEnabled}
                    >
                        Enable Notifications
                    </Form.Control>
                    <Form.HelpText tooltip>
                        Enable/Disable notifications
                    </Form.HelpText>
                </Form.Group>
                <Form.Group controlId="notification-volume">
                    <Form.ControlLabel>Volume level (%)</Form.ControlLabel>
                    <Form.Control
                        name="notificationVolume"
                        accepter={Slider}
                        progress
                        step={10}
                        graduated
                        renderMark={(mark) => mark}
                        value={settings.notificationVolume}
                        disabled={!settings.notificationsEnabled}
                    />
                    <Form.HelpText tooltip>
                        Set the volume level for all your notifications
                    </Form.HelpText>
                </Form.Group>
                <Form.Group controlId="theme">
                    <Form.ControlLabel>
                        Dark Theme 
                        <Form.HelpText tooltip>
                            Toggle Dark/Light Theme
                        </Form.HelpText>
                    </Form.ControlLabel>
                    <Form.Control value={settings.theme} accepter={Toggle} name="theme" checked={settings.theme} />
                </Form.Group>
                <Form.Group>
                    <ButtonToolbar className="flex justify-end">
                        <Animation.Fade in={hasUnsavedSettings}>
                            <Button
                                appearance="default"
                                onClick={cancelSettingsUpdate}
                            >
                                Cancel
                            </Button>
                        </Animation.Fade>
                        <Button
                            type="submit"
                            appearance="primary"
                            disabled={!hasUnsavedSettings}
                        >
                            Update Settings
                        </Button>
                    </ButtonToolbar>
                </Form.Group>

                <Animation.Bounce in={hasUnsavedSettings}>
                    <Message
                        showIcon
                        type="warning"
                        header="Warning!"
                        className="w-full"
                    >
                        You have unsaved settings!
                    </Message>
                </Animation.Bounce>
            </Form>
        </div>
    );
};

export default Searching;
