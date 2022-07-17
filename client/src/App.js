import { changeIsLogged } from './redux/Reducers/isLogged';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { SocketContext, socket } from './Context';

// components
import Login from './components/Login/Login';
import RoutesComponent from './components/Routes';
import { useEffect } from 'react';

function App() {
	const dispatch = useDispatch();
	const isLogged = useSelector((state) => state.isLogged);

	useEffect(() => {
		dispatch(changeIsLogged(window.localStorage.isLogged ?? false));
	}, []);

	useEffect(() => {
		console.log(isLogged);
		window.localStorage.setItem('isLogged', isLogged);
	}, [isLogged]);

	return (
		<SocketContext.Provider value={socket}>
			<div>
				{isLogged === 'true' || isLogged === true ? (
					<RoutesComponent />
				) : (
					<Login />
				)}
			</div>
		</SocketContext.Provider>
	);
}

export default App;
