import { Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './App.css';

// components
import NavBar from './components/NavBar/NavBar';
import Login from './components/Login/Login';

// icons
import OnClickOnStart from './components/SearchUser/OnClickOnStart/OnClickOnStart';
import SearchUser from './components/SearchUser/SearchUser';

function App() {
	const state = useSelector((state) => state);
	console.log(state);

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
