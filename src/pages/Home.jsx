import React, { Suspense } from "react"
import Loading from "../components/Loading"
import CurrentUtilization from "../components/home/CurrentUtilization";
import GraphCarousel from "../components/home/GraphCarousel";
import UsuChargers from "../components/home/UsuChargers";
import MonitorChart from "../components/home/MonitorChart";


const Home = () => {

  return (
    <div className="prose md:container md:mx-auto mx-auto mb-8">
          <MonitorChart />
      {/* <div className="card shadow-xl mx-4 my-8">
        <div className="card-body">
        </div>
      </div> */}
      <div className="my-4">
        <CurrentUtilization />
      </div>
      <div className="my-4">
        <GraphCarousel />
      </div>
      <div className="my-4">
        <UsuChargers />
      </div>
    </div>
  )
}

export default Home;