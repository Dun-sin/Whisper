import { Route, Routes } from 'react-router-dom';
import ComingSoon from 'pages/ComingSoon';

// Components
import NavBar from './NavBar';
import Searching from 'pages/Searching';
import Start from 'pages/Start';
import Logout from 'pages/Logout';

const RoutesComponent = () => {
    return (
        <div className="flex">
            <NavBar />
            <Routes>
                <Route path="/" element={<Start />} />
                <Route path="/founduser" element={<Searching />} />
                <Route path="/friends" element={<ComingSoon />} />
                <Route path="/profile" element={<ComingSoon />} />
                <Route path="/logout" element={<Logout />} />
            </Routes>
        </div>
    );
};

export default RoutesComponent;
