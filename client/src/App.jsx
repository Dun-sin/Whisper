import { changeIsLogged } from './redux/Reducers/isLogged';
import { useDispatch, useSelector } from 'react-redux';
import { SocketContext, socket } from './Context';

// Components
import Login from './components/Login/Login';
import RoutesComponent from './components/Routes';
import { useEffect } from 'react';

function App() {
    const dispatch = useDispatch();
    const isLogged = useSelector((state) => state.isLogged);
    const isUserLoggedIn = useSelector((state) => {
        const { isLogged } = state;

        return isLogged.isLoggedIn && isLogged.loginId !== null;
    });

    useEffect(() => {
        // We need to convert the JSON string we saved to localStorage
        // back to the original state object first before dispatching
        // NOTE: Using try...catch here to prevent blank page on first visit
        //       (previous issue that was solved)
        try {
            dispatch(changeIsLogged(JSON.parse(window.localStorage.isLogged)));
        } catch {
            dispatch(changeIsLogged({}));
        }
    }, []);

    useEffect(() => {
        console.log(isLogged);
        // `localStorage` only accepts strings so have to convert the state to
        // JSON format first
        window.localStorage.setItem('isLogged', JSON.stringify(isLogged));
    }, [isLogged]);

    return (
        <SocketContext.Provider value={socket}>
            <div>{isUserLoggedIn ? <RoutesComponent /> : <Login />}</div>
        </SocketContext.Provider>
    );
}

export default App;
