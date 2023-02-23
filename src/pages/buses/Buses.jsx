import React from "react";
import NewFlyerBusTable from "../../components/buses/NewFlyer/NewFlyerBusTable";
import VericitiBusTable from "../../components/buses/Vericiti/VericitiBusTable";

const Buses = () => {

  return (
    <div className="prose md:container md:mx-auto mx-auto">
      
      <h1 className="text-4xl font-bold">New Flyer Buses</h1>
      <NewFlyerBusTable />
      <h1 className="text-4xl font-bold mt-8">Vericiti Buses</h1>
      <VericitiBusTable />
      {/* <BusMap client:load zoom={13} /> */}
    </div>
  )
}

export default Buses;