import { Route, Routes } from 'react-router-dom';

// components
import NavBar from './NavBar/NavBar';
import OnClickOnStart from './SearchUser/OnClickOnStart/OnClickOnStart';
import SearchUser from './SearchUser/SearchUser';


const RoutesComponent = () => {
  return (
    <div className="flex">
      <NavBar />
      <Routes>
        <Route path='/' element={<SearchUser />} />
        <Route path='/founduser' element={<OnClickOnStart />} />
      </Routes>
    </div>
  )
}

export default RoutesComponent;
