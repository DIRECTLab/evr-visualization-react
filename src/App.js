import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import NavigationBar from './components/NavigationBar';
import Chargers from './pages/Chargers';
import Home from './pages/Home'
import Buses from './pages/Buses';
import EMS from './pages/EMS'
import Map from './pages/Map';
import Charger from './pages/Charger';

function App() {
  return (
  <>
    <BrowserRouter>
      <NavigationBar />
      <Routes>              
        <Route path="/" element={<Home />}/>
        <Route path="/chargers" element={<Chargers />} />
        <Route path="/chargers/charger/:id" element={<Charger />} />
        <Route path="/buses" element={<Buses />} />
        <Route path="/ems" element={<EMS />} />
        <Route path="/map" element={<Map />} />
      </Routes>
    </BrowserRouter>
  </>
  );
}

export default App;
