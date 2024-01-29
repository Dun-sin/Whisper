import { useMemo, useState } from 'react'; // Import useState
import {
  Animation,
  Button,
  ButtonToolbar,
  Divider,
  Form,
  Slider,
  Toggle,
} from 'rsuite';

import { Icon } from '@iconify/react';

import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/axios';

const Settings = () => {
  const {
    app,
    hasUnsavedSettings,
    updateSettings,
    updateTmpSettings,
    cancelSettingsUpdate,
  } = useApp();
  const { authState } = useAuth();

  // State to manage theme
  const [theme, setTheme] = useState('light');

  const settings = useMemo(() => {
    return app.tmpSettings
      ? { ...app.settings, ...app.tmpSettings }
      : app.settings;
  }, [app.settings, app.tmpSettings]);

  const updateUserSettings = async () => {
    const data = {
      email: authState?.email,
      settings,
    };
    try {
      const response = await api.post('/profile', data);
      console.log(response.data.message);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    updateSettings();
    await updateUserSettings();
  };

  const handleChange = (newSettings) => {
    updateTmpSettings(newSettings);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`flex justify-center items-center flex-col min-w-[calc(100%-120px)] p-2 gap-5 ${theme === 'dark' ? 'dark' : ''}`}>
      <div className='w-11/12 sm:w-[70%] md:w-[55%] lg:w-[35%] md:min-w-[300px] h-auto dark:bg-primary bg-light rounded-3xl px-6 py-6 md:px-14 md:py-20 border shadow-xl text-primary dark:text-light '>
        <Form onSubmit={handleSubmit} onChange={handleChange}>
          <Form.Group className='flex justify-between' controlId='app-theme'>
            <div className='w-5/6'>
              <div className='flex'>
                <Icon
                  color={theme === 'dark' ? 'white' : 'gray'}
                  icon='ion:invert-mode'
                  height='18'
                  width='18'
                  className='mr-1.5'
                />
                <Form.ControlLabel className='text-primary dark:text-light text-[12px] sm:text-xs md:text-base font-normal'>
                  MODE
                </Form.ControlLabel>
              </div>
              <Form.HelpText className='text-zinc-600 text-xs dark:text-white'>
                {theme === 'dark' ? 'Dark' : 'Light'} mode
              </Form.HelpText>
            </div>
            <div className='flex items-center'>
              <Form.Control
                className='flex justify-end items-center'
                name='theme'
                accepter={Toggle}
                checked={theme === 'dark'}
                onChange={toggleTheme} // Toggle theme on change
                checkedChildren={
                  <Icon
                    color={theme === 'dark' ? 'white' : 'gray'}
                    icon='ic:round-dark-mode'
                    height='22'
                    width='22'
                    className='mt-1'
                  />
                }
                unCheckedChildren={
                  <Icon
                    color={theme === 'dark' ? 'white' : 'gray'}
                    icon='ic:round-light-mode'
                    height='22'
                    width='22'
                    className='mt-1'
                  />
                }
                size='lg'
              />
            </div>
          </Form.Group>
          <Divider className='border border-gray-500 my-2 sm:my-4 md:my-7'></Divider>
          <Form.Group
            className='flex justify-between'
            controlId='notifications-enabled'
          >
            <div className='w-5/6'>
              <div className='flex'>
                <Icon
                  color={settings.theme ? 'white' : 'gray'}
                  icon='bxs:bell-ring'
                  height='18'
                  width='18'
                  className='mr-1.5'
                />
                <Form.ControlLabel className='text-primary  dark:text-light text-[12px] sm:text-xs md:text-base font-normal'>
                  NOTIFICATION
                </Form.ControlLabel>
              </div>
              <Form.HelpText className='text-zinc-600 text-xs dark:text-white'>
                Enable/Disable notifications
              </Form.HelpText>
            </div>
            <div className='w-1/6 flex items-center'>
              <Form.Control
                name='notificationsEnabled'
                className='flex justify-end'
                accepter={Toggle}
                checked={settings.notificationsEnabled}
                value={!settings.notificationsEnabled}
                size='lg'
              />
            </div>
          </Form.Group>
          <Divider className='border border-gray-500 my-2 sm:my-4 md:my-7'></Divider>
          <Form.Group controlId='notification-volume'>
            <div className='flex'>
              <Icon
                color={settings.theme ? 'white' : 'gray'}
                icon='ic:baseline-volume-up'
                height='20'
                width='19'
                className='mr-1'
              />
              <Form.ControlLabel className='text-primary  dark:text-light  text-[12px] sm:text-xs md:text-base font-normal'>
                VOLUME LEVEL
              </Form.ControlLabel>
            </div>
            <Form.HelpText className='text-zinc-600 text-xs mb-4 dark:text-white'>
              Set the volume level for all your notifications
            </Form.HelpText>
            <Form.Control
              name='notificationVolume'
              accepter={Slider}
              progress
              barClassName='bg-gray-400'
              value={settings.notificationVolume}
              disabled={!settings.notificationsEnabled}
              renderTooltip={value => `${value}%`}
            />
          </Form.Group>
          <Divider className='border border-gray-500 my-2 sm:my-4 md:my-7'></Divider>
          <Form.Group>
            {hasUnsavedSettings && (
              <Animation.Bounce in={hasUnsavedSettings}>
                <div className='w-[100%] flex justify-end mb-3.5 text-xs items-center'>
                  <Icon
                    className='text-highlight'
                    icon='fluent:warning-20-filled'
                    height='16'
                    width='16'
                  />
                  <p className='dark:text-highlight text-red text-[10px] md:text-sm'>
                    Warning: You have unsaved settings
                  </p>
                </div>
              </Animation.Bounce>
            )}
            <ButtonToolbar className='flex md:justify-end justify-center'>
              <Animation.Fade in={hasUnsavedSettings}>
                <Button
                  appearance='primary'
                  onClick={cancelSettingsUpdate}
                  className='text-[12px] sm:text-xs md:text-base bg-secondary font-normal w-24 h-9 rounded-md hover:bg-slate-700'
                >
                  Cancel
                </Button>
              </Animation.Fade>
              <Button
                type='submit'
                appearance='primary'
                disabled={!hasUnsavedSettings}
                className='text-base font-normal w-24 h-9 bg-blue-500 rounded-md hover:bg-blue-400'
              >
                Update
              </Button>
            </ButtonToolbar>
          </Form.Group>
        </Form>
      </div>
    </div>
  );
};

export default Settings;
