import { useMemo } from 'react';
import {
    Animation,
    Button,
    ButtonToolbar,
    Checkbox,
    Divider,
    Form,
    Dropdown,
    Message,
    Slider,
} from 'rsuite';

import { Icon } from '@iconify/react';

import { useApp } from 'src/context/AppContext';

import { useDarkMode } from 'src/context/DarkModeContext';

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

    const { darkMode, setDarkMode } = useDarkMode();

    return (
        <div
            className="flex justify-center items-center flex-col min-w-[calc(100%-120px)] p-2 gap-5 bg-white dark:bg-primary min-h-full"
        >
            <Form onSubmit={handleSubmit} onChange={handleChange}>
                <Divider className="text-primary dark:text-white">Mode</Divider>
                <ButtonToolbar>
                    <Dropdown
                        active
                        appearance='primary'
                        title={darkMode ?
                            <div className='flex items-center'>
                                <Icon
                                    className='mr-2'
                                    icon="ic:round-dark-mode"
                                    color="primary"
                                    height="14"
                                    width="14"
                                />
                                <p>Dark</p>
                            </div>
                            :
                            <div className='flex items-center'>
                                <Icon
                                    className='mr-2'
                                    icon="entypo:light-up"
                                    color="primary"
                                    height="14"
                                    width="14"
                                />
                                <p>Light</p>
                            </div>
                        }
                        activeKey={darkMode ? "dark" : "light"}
                        onSelect={(eventKey) => {
                            setDarkMode(
                                eventKey === "dark" ? true : false
                            )
                        }}
                    >
                        <Dropdown.Item
                            eventKey="dark"
                            icon={<Icon
                                icon="ic:round-dark-mode"
                                color="primary"
                                height="14"
                                width="14"
                            />}
                            className='grid grid-cols-2 items-center pr-10'
                        >
                            Dark
                        </Dropdown.Item>
                        <Dropdown.Item
                            eventKey="light"
                            icon={<Icon
                                className='mr-2'
                                icon="entypo:light-up"
                                color="primary"
                                height="14"
                                width="14"
                            />}
                            className='grid grid-cols-2 items-center pr-10'
                        >
                            Light
                        </Dropdown.Item>
                    </Dropdown>
                </ButtonToolbar>

                <Divider className="text-primary dark:text-white">Notifications</Divider>
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
                            active
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
