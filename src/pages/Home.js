import React from "react"
import CurrentUtilization from "../components/home/CurrentUtilization";
import MonitorChart from "../components/home/MonitorChart";
import UsuChargers from "../components/home/UsuChargers";

const Home = () => {

  return (
    <div className="prose md:container md:mx-auto mx-auto mb-8">
      <div className="card shadow-xl mx-4 my-8">
        <div className="card-body">
          <MonitorChart />
        </div>
      </div>
      <div className="my-4">
        <CurrentUtilization />
      </div>
      <div className="my-4">
        {/* <GraphCarousel /> */}
      </div>
      <div className="my-4">
        <UsuChargers />
      </div>
    </div>
  )
}

export default Home;