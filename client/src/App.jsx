import { SocketContext, socket } from './context/Context';

// Components
import Login from 'pages/Login';
import RoutesComponent from 'components/Routes';
import { useAuth } from './context/AuthContext';
import 'react-toastify/dist/ReactToastify.css';

function App() {

    const { isLoggedIn } = useAuth();

    return (
        <SocketContext.Provider value={socket}>
           
            <div>{isLoggedIn ? <RoutesComponent /> : <Login />}</div>
        </SocketContext.Provider>
    );
}

export default App;
