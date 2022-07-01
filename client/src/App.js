import { useSelector } from 'react-redux';
import { SocketContext, socket } from './Context';

// components
import Login from './components/Login/Login';
import RoutesComponent from './components/Routes';

function App() {
	const isLogged = useSelector((state) => state.isLogged);
	return (
		<SocketContext.Provider value={socket}>
			<div>{isLogged ? <RoutesComponent /> : <Login />}</div>;
		</SocketContext.Provider>
	);
}

export default App;
