import React, { Suspense } from "react"
import MonitorChart from "../components/home/MonitorChart";
import GraphCarousel from "../components/home/GraphCarousel";
const UsuChargers = React.lazy(() => import("../components/home/UsuChargers"));


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
  )
}

export default Home;