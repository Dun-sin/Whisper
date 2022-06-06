import { useSelector } from 'react-redux';

// components
import Login from './components/Login/Login';
import RoutesComponent from './components/Routes';

function App() {
	const isLogged = useSelector((state) => state.isLogged);

	console.log(isLogged);
	return <div>{isLogged ? <RoutesComponent /> : <Login />}</div>;
}

export default App;
