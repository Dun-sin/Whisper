import { Route, Routes } from 'react-router-dom';
import ComingSoon from './ComingSoon';

// Components
import NavBar from './NavBar/NavBar';
import OnClickOnStart from './SearchUser/OnClickOnStart/OnClickOnStart';
import SearchUser from './SearchUser/SearchUser';

const RoutesComponent = () => {
    return (
        <div className="flex">
            <NavBar />
            <Routes>
                <Route path="/" element={<SearchUser />} />
                <Route path="/founduser" element={<OnClickOnStart />} />
                <Route path="/friends" element={<ComingSoon />} />
                <Route path="/profile" element={<ComingSoon />} />
            </Routes>
        </div>
    );
};

export default RoutesComponent;
