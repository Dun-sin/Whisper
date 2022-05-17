import { useState } from 'react';

// components
import Login from './components/Login/Login';
import RoutesComponent from './components/Routes';

function App() {
	const [isLogged, setIsLogged] = useState(false);

	return <div>{isLogged ? <RoutesComponent /> : <Login />}</div>;
}

export default App;
