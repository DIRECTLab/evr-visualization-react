import React from "react";
import BusMap from "../../components/buses/BusMap";
import NewFlyerBusTable from "../../components/buses/NewFlyer/NewFlyerBusTable";
import VericitiBusTable from "../../components/buses/Vericiti/VericitiBusTable";

const Buses = () => {

  return (
    <div className="prose md:container md:mx-auto mx-auto">
      
      <h1 className="text-4xl font-bold">New Flyer Buses</h1>
      <NewFlyerBusTable />
      <div className="divider" />
      <h1 className="text-4xl font-bold mt-8">Vericiti Buses</h1>
      <VericitiBusTable />
      <div className="divider" />
      <div className="my-8"/>
      <BusMap />
      <div className="mb-16"/>
    </div>
  )
}

export default Buses;