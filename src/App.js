import { Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
        </Routes>
    );
}

export default App;
