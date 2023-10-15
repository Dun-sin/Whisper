import { useMemo } from 'react';
import {
    Animation,
    Button,
    ButtonToolbar,
    Divider,
    Form,
// <<<<<<< feature/light-mode
    Dropdown,
    Message,
    Slider,
    Toggle
} from 'rsuite';
// <<<<<<< feature/light-mode

import { Icon } from '@iconify/react';

// =======
// import { Icon } from '@iconify/react';
// >>>>>>> light-mode
import { useApp } from 'src/context/AppContext';
import { useAuth } from 'src/context/AuthContext';
import { api } from 'src/lib/axios';

import { useDarkMode } from 'src/context/DarkModeContext';

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

    const { darkMode, setDarkMode } = useDarkMode();

    return (
        <div
            className="flex justify-center items-center flex-col min-w-[calc(100%-120px)] p-2 gap-5 bg-light dark:bg-primary min-h-full"
        >
// <<<<<<< feature/light-mode
//             <Form onSubmit={handleSubmit} onChange={handleChange}>
//                 <Divider className="text-primary dark:text-white">Mode</Divider>
//                 <ButtonToolbar>
//                     <Dropdown
//                         active
//                         appearance='primary'
//                         title={darkMode ?
//                             <div className='flex items-center'>
//                                 <Icon
//                                     className='mr-2'
//                                     icon="ic:round-dark-mode"
//                                     color="primary"
//                                     height="14"
//                                     width="14"
//                                 />
//                                 <p>Dark</p>
//                             </div>
//                             :
//                             <div className='flex items-center'>
//                                 <Icon
//                                     className='mr-2'
//                                     icon="entypo:light-up"
//                                     color="primary"
//                                     height="14"
//                                     width="14"
//                                 />
//                                 <p>Light</p>
//                             </div>
//                         }
//                         activeKey={darkMode ? "dark" : "light"}
//                         onSelect={(eventKey) => {
//                             setDarkMode(
//                                 eventKey === "dark" ? true : false
//                             )
//                         }}
//                     >
//                         <Dropdown.Item
//                             eventKey="dark"
//                             icon={<Icon
//                                 icon="ic:round-dark-mode"
//                                 color="primary"
//                                 height="14"
//                                 width="14"
//                             />}
//                             className='grid grid-cols-2 items-center pr-10'
//                         >
//                             Dark
//                         </Dropdown.Item>
//                         <Dropdown.Item
//                             eventKey="light"
//                             icon={<Icon
//                                 className='mr-2'
//                                 icon="entypo:light-up"
//                                 color="primary"
//                                 height="14"
//                                 width="14"
//                             />}
//                             className='grid grid-cols-2 items-center pr-10'
//                         >
//                             Light
//                         </Dropdown.Item>
//                     </Dropdown>
//                 </ButtonToolbar>

//                 <Divider className="text-primary dark:text-white">Notifications</Divider>
//                 <Form.Group controlId="notifications-enabled">
//                     <Form.Control
//                         name="notificationsEnabled"
//                         accepter={Checkbox}
//                         checked={settings.notificationsEnabled}
//                         value={!settings.notificationsEnabled}
//                     >
//                         Enable Notifications
//                     </Form.Control>
//                     <Form.HelpText tooltip>
//                         Enable/Disable notifications
//                     </Form.HelpText>
//                 </Form.Group>
//                 <Form.Group controlId="notification-volume">
//                     <Form.ControlLabel>Volume level (%)</Form.ControlLabel>
//                     <Form.Control
//                         name="notificationVolume"
//                         accepter={Slider}
//                         progress
//                         step={10}
//                         graduated
//                         renderMark={(mark) => mark}
//                         value={settings.notificationVolume}
//                         disabled={!settings.notificationsEnabled}
//                     />
//                     <Form.HelpText tooltip>
//                         Set the volume level for all your notifications
//                     </Form.HelpText>
//                 </Form.Group>
//                 <Form.Group>
//                     <ButtonToolbar className="flex justify-end">
//                         <Animation.Fade in={hasUnsavedSettings}>
// =======
            <div className='w-[33%] h-[85%] bg-secondary bg-opacity-30 rounded-3xl px-14 py-20 border border-slate-800'>
                <Form onSubmit={handleSubmit} onChange={handleChange}>
                    <Form.Group className='flex justify-between' controlId="notifications-enabled">
                        <div className='w-5/6'>
                            <div className='flex items-center'>
                                <Icon
                                    color="white"
                                    icon="ion:invert-mode"
                                    height="18"
                                    width="18"
                                    className='mr-1.5'
                                />
                                <Form.ControlLabel className='text-white text-base font-normal'>MODE</Form.ControlLabel>
                            </div>
                            <Form.HelpText className='text-zinc-600 text-xs'>
                                Light/Dark mode
                            </Form.HelpText>
                        </div>
                        <div className='flex items-center'>
                            <Form.Control
                                className='flex justify-end items-center'
                                name="darkModeEnabled"
                                accepter={Toggle}
                                checkedChildren={
                                    <Icon
                                        color="white"
                                        icon="ic:round-dark-mode"
                                        height="22"
                                        width="22"
                                        className='mt-1'
                                    />
                                }
                                unCheckedChildren={
                                    <Icon
                                        color="white"
                                        icon="ic:round-light-mode"
                                        height="22"
                                        width="22"
                                        className='mt-1'
                                    />
                                }
                                size="lg"
                            />
                        </div>
                    </Form.Group>
                    <Divider className="border border-slate-800 my-7"></Divider>
                    <Form.Group className='flex justify-between' controlId="notifications-enabled">
                        <div className='w-5/6'>
                            <div className='flex items-center'>
                                <Icon
                                    color="white"
                                    icon="bxs:bell-ring"
                                    height="18"
                                    width="18"
                                    className='mr-1.5'
                                />
                                <Form.ControlLabel className='text-white text-base font-normal'>NOTIFICATION</Form.ControlLabel>
                            </div>
                            <Form.HelpText className='text-zinc-600 text-xs'>
                                Enable/Disable notifications
                            </Form.HelpText>
                        </div>
                        <div className='w-1/6 flex items-center'>
                            <Form.Control
                                name="notificationsEnabled"
                                className='flex justify-end'
                                accepter={Toggle}
                                checked={settings.notificationsEnabled}
                                value={!settings.notificationsEnabled}
                                size="lg"
                            />
                        </div>
                    </Form.Group>
                    <Divider className="border border-slate-800 my-7"></Divider>
                    <Form.Group controlId="notification-volume">
                        <div className='flex items-center'>
                            <Icon
                                color="white"
                                icon="ic:baseline-volume-up"
                                height="20"
                                width="19"
                                className='mr-1'
                            />
                            <Form.ControlLabel className='text-white text-base font-normal'>VOLUME LEVEL</Form.ControlLabel>
                        </div>
                        <Form.HelpText className='text-zinc-600 text-xs mb-4'>
                            Set the volume level for all your notifications
                        </Form.HelpText>
                        <Form.Control
                            name="notificationVolume"
                            accepter={Slider}
                            progress
                            value={settings.notificationVolume}
                            disabled={!settings.notificationsEnabled}
                            renderTooltip={(value) => `${value}%`}
                        />
                    </Form.Group>
                    <Divider className="border border-slate-800 my-7"></Divider>
                    <Form.Group>
                        <Animation.Bounce in={hasUnsavedSettings}>
                            <div className="w-[100%] flex justify-end mb-3.5 text-xs">
                                <Icon
                                    className='text-highlight'
                                    icon="fluent:warning-20-filled"
                                    height="16"
                                    width="16"
                                />
                                <p className="text-highlight">Warning: You have unsaved settings</p>
                            </div>
                        </Animation.Bounce>
                        <ButtonToolbar className="flex justify-end">
                            <Animation.Fade in={hasUnsavedSettings}>
                                <Button
                                    appearance="primary"
                                    onClick={cancelSettingsUpdate}
                                    className='text-base font-normal bg-secondary font-normal w-24 h-9 rounded-md hover:bg-slate-700'
                                >
                                    Cancel
                                </Button>
                            </Animation.Fade>
// >>>>>>> light-mode
//                             <Button
//                                 type="submit"
//                                 appearance="primary"
//                                 disabled={!hasUnsavedSettings}
//                                 className='text-base font-normal w-24 h-9 bg-blue-500 rounded-md hover:bg-blue-400'
//                             >
//                                 Update
//                             </Button>
// <<<<<<< feature/light-mode
//                         </Animation.Fade>
//                         <Button
//                             type="submit"
//                             appearance="primary"
//                             active
//                             disabled={!hasUnsavedSettings}
//                         >
//                             Update Settings
//                         </Button>
//                     </ButtonToolbar>
//                 </Form.Group>

//                 <Animation.Bounce in={hasUnsavedSettings}>
//                     <Message
//                         showIcon
//                         type="warning"
//                         header="Warning!"
//                         className="w-full"
//                     >
//                         You have unsaved settings!
//                     </Message>
//                 </Animation.Bounce>
//             </Form>
// =======
                        </ButtonToolbar>
                    </Form.Group>
                </Form>
            </div>
// >>>>>>> light-mode
        </div>
    );
};

export default Searching;
