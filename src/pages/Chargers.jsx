import React from "react";
import { Divider } from "react-daisyui";
import ChargerTable from "../components/chargers/ChargerTable";
import LocationTable from "../components/chargers/LocationTable";


const Chargers = () => {

  return (
    <div className="prose md:container md:mx-auto mx-auto">
      <h1 className="text-4xl font-bold">Charger Data</h1>
      <ChargerTable />
      {/* <ChargerMap client:load zoom={13} /> */}
      <div className="divider"/>
      <h1 className="text-4xl font-bold my-4">Chargers By Location</h1>
      <LocationTable />
    </div>
  )
}

export default Chargers;
