import React from "react";
import { useParams } from "react-router-dom";
import LocationUtilization from "../components/chargers/location/LocationUtilization";

const Location = () => {

  const { id } = useParams();

  return (
    <div className="prose md:container md:mx-auto mx-auto">
      <h1 className="text-4xl font-bold my-4">Charger Utilization</h1>
      <LocationUtilization id={id} />
    </div>
  );

}

export default Location;
