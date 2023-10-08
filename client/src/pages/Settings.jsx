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
} from 'rsuite';

import { useApp } from 'src/context/AppContext';
import { useAuth } from 'src/context/AuthContext';
import { api } from 'src/lib/axios';

const Searching = () => {
    const {
        app,
        hasUnsavedSettings,
        updateSettings,
        updateTmpSettings,
        cancelSettingsUpdate,
    } = useApp();
    const { authState } = useAuth();

    const settings = useMemo(() => {
        return app.tmpSettings
            ? { ...app.settings, ...app.tmpSettings }
            : app.settings;
    });

    const updateUserSettings = async () => {
        const data = {
            email: authState?.email,
            settings
        };
        try {
            const response = await api.post('/profile', data);
            console.log(response.data.message);
        } catch (error) {
            console.error(error);
        }
    };

    /**
     *
     * @param {Event | SubmitEvent} e
     */
    const handleSubmit = async () => {
        updateSettings();
        await updateUserSettings();
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
