import React from "react";
import ChargerTable from "../components/chargers/ChargerTable";


const Chargers = () => {

  return (
    <div className="prose md:container md:mx-auto mx-auto">
      <h1 className="text-4xl font-bold">Charger Data</h1>
      <ChargerTable />
      {/* <ChargerMap client:load zoom={13} /> */}
  </div>
  )
}

export default Chargers;