import React from "react";
import { useParams } from "react-router-dom";
import CurtailmentChart from "../components/chargers/charger/CurtailmentChart";
import CurtailmentInfo from "../components/chargers/charger/CurtailmentInfo";
import StatusTable from "../components/chargers/charger/StatusTable";
import TransactionTable from "../components/chargers/charger/TransactionTable";

const Charger = () => {

  const { id } = useParams()

  return (
    <div className="prose md:container md:mx-auto mx-auto mb-8">
      <h1 className="text-4xl font-bold mb-8">Charger Details</h1>
      
      <CurtailmentInfo id={id} />

      <div className="divider"></div>

      <h2 className="text-2xl font-bold mb-8">Curtailment - Last 24 Hours</h2>
      <CurtailmentChart id={id} />

      <div className="divider" />
      <StatusTable id={id} />

      <div className="divider"></div>
      
      {/* <h2>Current Curtailment</h2> */}

      <h2 className="text-2xl font-bold">Transactions</h2>
      <TransactionTable id={id}/>

      <div className="divider"></div> 

      <h2 className="text-2xl font-bold">Charge Profiles</h2>
      {/* <ChargeProfileTable /> */}
      </div>
  )
} 

export default Charger