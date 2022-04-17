import { Route, Routes } from 'react-router-dom';
import './App.css';
import NavBar from './components/Header/NavBar';

import Login from './components/Login/Login';
import OnClickOnStart from './components/SearchUser/OnClickOnStart/OnClickOnStart';
import SearchUser from './components/SearchUser/SearchUser';

function App() {
	return (
		<div className='flex'>
			<NavBar />
			<Routes>
				<Route path='/searchuser' element={<SearchUser />} />
				<Route path='/searchuser/founduser' element={<OnClickOnStart />} />
			</Routes>
		</div>
	);
}

export default App;
