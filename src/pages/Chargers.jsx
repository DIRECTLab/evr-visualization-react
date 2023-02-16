import React from "react";
import ChargerTable from "../components/chargers/ChargerTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const Chargers = () => {

  return (
    <div className="prose md:container md:mx-auto mx-auto">
      <h1 className="text-5xl font-bold">Charger Data</h1>
      <FontAwesomeIcon icon="check-square" /><br /><br />
      <ChargerTable />
      {/* <ChargerMap client:load zoom={13} /> */}
  </div>
  )
}

export default Chargers;