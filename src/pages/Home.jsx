import React, { Suspense } from "react"
import Loading from "../components/Loading"
// import CurrentUtilization from "../components/home/CurrentUtilization";
// import GraphCarousel from "../components/home/GraphCarousel";
// import MonitorChart from "../components/home/MonitorChart";
// import UsuChargers from "../components/home/UsuChargers";

const CurrentUtilization = React.lazy(() => import("../components/home/CurrentUtilization"))
const GraphCarousel = React.lazy(() => import("../components/home/GraphCarousel"))
const MonitorChart = React.lazy(() => import("../components/home/MonitorChart"))
const UsuChargers = React.lazy(() => import("../components/home/UsuChargers"))

const Home = () => {

  return (
    <div className="prose md:container md:mx-auto mx-auto mb-8">
      <div className="card shadow-xl mx-4 my-8">
        <div className="card-body">
          <Suspense fallback={<Loading />}>
            <MonitorChart />
          </Suspense>
        </div>
      </div>
      <div className="my-4">
        <Suspense fallback={<Loading />}>
          <CurrentUtilization />
        </Suspense>
      </div>
      <div className="my-4">
        <Suspense fallback={<Loading />}>
          <GraphCarousel />
        </Suspense>
      </div>
      <div className="my-4">
        <Suspense fallback={<Loading />}>
          <UsuChargers />
        </Suspense>
      </div>
    </div>
  )
}

export default Home;