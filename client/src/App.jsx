import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { ChatProvider } from './context/ChatContext';
import ComingSoon from 'pages/ComingSoon';
import Home from 'pages/Home';
import NavBar from 'components/NavBar';
import NoPage from './pages/NoPage';
import Profile from './pages/Profile';
import ProtectedRoutes from 'components/ProtectedRoutes';
import ReactGA from 'react-ga4';
import Searching from 'pages/Searching';
import Settings from 'pages/Settings';
import Start from 'pages/Start';
import { useApp } from 'src/context/AppContext';
import { useAuth } from 'context/AuthContext';
import useIsTabActive from './hooks/useIsTabActive';

function App() {
  ReactGA.initialize(import.meta.env.VITE_GOOGLE_ANALYTICS);

  const { isLoggedIn } = useAuth();
  const { updateOnlineStatus, app } = useApp();

  const { settings } = app;
  const [onlineStatus, setOnlineStatus] = useState(null);

  const isTabActive = useIsTabActive();

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    if (isTabActive) {
      setOnlineStatus('online');
    } else {
      setOnlineStatus(new Date());
    }
  }, [isTabActive]);

  useEffect(() => {
    updateOnlineStatus(onlineStatus);
  }, [onlineStatus]);

  return (

    <div className={`flex flex-col-reverse md:flex-row h-screen ${settings.theme && 'dark'}`}>
      {isLoggedIn && <NavBar />}
      <Routes>
        <Route exact path="/" element={<ProtectedRoutes isLoggedIn={isLoggedIn} />}>
          <Route exact path="/" element={<ChatProvider><Start /></ChatProvider>} />
          {/* TODO: Sepreate searching and foundUser into different routes */}
          <Route exact path="/founduser" element={<Searching />} />
          <Route exact path="/friends" element={<ComingSoon />} />
          <Route exact path="/profile" element={<Profile />} />
          <Route exact path="/settings" element={<Settings />} />
        </Route>

        <Route exact path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Home />} />
        <Route path="*" element={<NoPage />} />
      </Routes>
    </div>

  );
}

export default App;
