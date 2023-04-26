import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import NavigationBar from './components/NavigationBar';
import React, { Suspense, lazy } from 'react';
import Loading from './components/Loading';

const Chargers = lazy(() => import('./pages/Chargers'))
const Home = lazy(() => import('./pages/Home'))
const Buses = lazy(() => import( './pages/buses/Buses'))
const EMS = lazy(() => import('./pages/EMS'))
const Map = lazy(() => import('./pages/Map'))
const Charger = lazy(() => import('./pages/Charger'))
const GustavKlein = lazy(() => import('./pages/EMS/GustavKlein'))
const Yaskawa = lazy(() => import('./pages/EMS/Yaskawa'))
const NewFlyerBus = lazy(() => import('./pages/buses/NewFlyerBus'))
const Fronius = lazy(() => import('./pages/EMS/Fronius'))
const SpecificFroniusModel = lazy(() => import('./pages/EMS/SpecificFroniusModel'))
const Sma50 = lazy(() => import('./pages/EMS/Sma50'))
const Sma7 = lazy(() => import('./pages/EMS/Sma7'))
const ViricityBus = lazy(() => import('./pages/buses/ViricityBus'))


function App() {
  return (
  <>
    <BrowserRouter>
      <NavigationBar />
      <Suspense fallback={<Loading />}>
        <Routes>              
          <Route path="/" element={<Home />}/>
          <Route path="/chargers" element={<Chargers />} />
          <Route path="/chargers/charger/:id" element={<Charger />} />
          <Route path="/buses" element={<Buses />} />
          <Route path="/buses/newflyer/:id" element={<NewFlyerBus />} />
          <Route path="/buses/viricity/:id" element={<ViricityBus />} />
          <Route path="/map" element={<Map />} />
          <Route path="/ems" element={<EMS />} />
          <Route path="/ems/gustav-klein" element={<GustavKlein />} />
          <Route path="/ems/yaskawa" element={<Yaskawa />} />
          <Route path="/ems/fronius" element={<Fronius />} />
          <Route path="/ems/fronius/:id" element={<SpecificFroniusModel />} />
          <Route path="/ems/sma50" element={<Sma50 />} />
          <Route path="/ems/sma7" element={<Sma7 />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </>
  );
}

export default App;
