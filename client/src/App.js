import { Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';

// components
import NavBar from './components/NavBar/NavBar';
import Login from './components/Login/Login';

// icons
import OnClickOnStart from './components/SearchUser/OnClickOnStart/OnClickOnStart';
import SearchUser from './components/SearchUser/SearchUser';

function App() {
	return (
		<div className='flex'>
			<NavBar />
			<Routes>
				<Route path='/' element={<Login />} />
				<Route path='/searchuser' element={<SearchUser />} />
				<Route path='/searchuser/founduser' element={<OnClickOnStart />} />
			</Routes>
		</div>
	);
}

export default App;
