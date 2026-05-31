import './App.css';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import { useSelector } from 'react-redux';


function App() {
  const { token } = useSelector((state) => state.auth)

  return (
    <div className={`app-shell${token ? '' : ' app-shell--auth'}`}>
      {token ? <Dashboard /> : <Login />}
    </div>
  )
}

export default App
