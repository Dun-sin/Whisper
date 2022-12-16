import useTheme from 'src/hooks/useTheme';
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
import { BsFillMoonFill, BsSunFill } from 'react-icons/bs';

import { useApp } from 'src/context/AppContext';

const Searching = () => {
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
    };

    const handleChange = (newSettings) => {
        updateTmpSettings(newSettings);
    };

    const context = useTheme();
    localStorage.setItem('theme', context.theme);

    const toggleMode = () => {
        context.toggle();
    };
    const light = context.theme === 'light';
    return (
        <div
            className={`md:flex md:justify-center md:items-center flex-col 
            w-full p-2 gap-5 bg-primary ${light && 'bg-light text-black'} 
            transition-colors duration-500 md:min-h-screen min-h-[calc(100vh-70px)]`}
        >
            <Form onSubmit={handleSubmit} onChange={handleChange}>
                <Divider className={`${light && 'text-black'} text-white`}>
                    Notifications
                </Divider>
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
                            className={`${light && 'text-black'}`}
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

                <Form.Group>
                    <Divider className={`${light && 'text-black'} text-white`}>
                        Change Mode
                    </Divider>
                    <ButtonToolbar
                        className="flex"
                        aria-label="outlined button group"
                    >
                        {light ? (
                            <Button
                                onClick={toggleMode}
                                className="bg-primary
                                 focus:bg-primary
                                 hover:bg-[#0f3a5e] 
                                flex justify-between 
                                gap-2 items-center
                                transition-all duration-500"
                                appearance="primary"
                            >
                                <BsFillMoonFill />
                                Dark
                            </Button>
                        ) : (
                            <Button
                                onClick={toggleMode}
                                className="bg-light
                                hover:bg-[#d1d1d4]
                                hover:text-primary
                             focus:bg-light
                              focus:text-primary
                               text-primary flex 
                               justify-between gap-2 
                               items-center
                               transition-all duration-500"
                                appearance="primary"
                            >
                                <BsSunFill />
                                Light
                            </Button>
                        )}
                    </ButtonToolbar>
                    <Form.HelpText tooltip>
                        Enable/Disable Dark Mode
                    </Form.HelpText>
                </Form.Group>
            </Form>
        </div>
    );
};

export default Searching;
