import React from "react";
const BusMap = React.lazy(() => import("../../components/buses/BusMap"));
const NewFlyerBusTable = React.lazy(() => import("../../components/buses/NewFlyer/NewFlyerBusTable"))
const VericitiBusTable = React.lazy(() => import("../../components/buses/Vericiti/VericitiBusTable"))

const Buses = () => {

  return (
    <div className="prose md:container md:mx-auto mx-auto">
      
      <h1 className="text-4xl font-bold">New Flyer Buses</h1>
      <NewFlyerBusTable />
      <div className="divider" />
      <h1 className="text-4xl font-bold mt-8">Viricity Buses</h1>
      <VericitiBusTable />
      <div className="divider" />
      <div className="my-8"/>
      <BusMap />
      <div className="mb-16"/>
    </div>
  )
}

export default Buses;