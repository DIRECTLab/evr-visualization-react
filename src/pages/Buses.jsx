import React from "react";
import BusTable from "../components/buses/BusTable";

const Buses = () => {

  return (
    <div class="prose md:container md:mx-auto mx-auto">
      <h1 className="text-5xl font-bold">Buses</h1>
      <BusTable />
      {/* <BusMap client:load zoom={13} /> */}
    </div>
  )
}

export default Buses;