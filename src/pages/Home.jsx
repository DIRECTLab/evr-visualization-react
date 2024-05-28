import React from "react"
import MonitorChart from "../components/home/MonitorChart";
import GraphCarousel from "../components/home/GraphCarousel";
import UsuChargers from "../components/home/UsuChargers";


const Home = () => {

  return (
    <div className="prose md:container md:mx-auto mx-auto mb-8">
      <MonitorChart />
      <div className="my-4">
        <GraphCarousel />
      </div>
      <div className="my-4">
        <UsuChargers />
      </div>
    </div>
  );
}

export default Home;
