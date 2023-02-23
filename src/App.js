import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import NavigationBar from './components/NavigationBar';
import Chargers from './pages/Chargers';
import Home from './pages/Home'
import Buses from './pages/buses/Buses';
import EMS from './pages/EMS'
import Map from './pages/Map';
import Charger from './pages/Charger';
import GustavKlein from './pages/EMS/GustavKlein';
import Yaskawa from './pages/EMS/Yaskawa';
import NewFlyerBus from './pages/buses/NewFlyerBus';

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
        <Route path="/buses/newflyer/:id" element={<NewFlyerBus />} />
        <Route path="/map" element={<Map />} />
        <Route path="/ems" element={<EMS />} />
        <Route path="/ems/gustav-klein" element={<GustavKlein />} />
        <Route path="/ems/yaskawa" element={<Yaskawa />} />
        <Route path="/ems/fronius" element={<EMS />} />
        <Route path="/ems/sma50" element={<EMS />} />
        <Route path="/ems/sma7" element={<EMS />} />

      </Routes>
    </BrowserRouter>
  </>
  );
}

export default App;
