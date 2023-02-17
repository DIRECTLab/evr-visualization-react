import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../api";
import Loading from "../../Loading";

const CurtailmentInfo = ({id}) => {

  const [curValue, setCurValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [chargerDetails, setChargerDetails] = useState({})


  const loadData = async () => {
    const res = await api.charger(id).getChargeProfile();
    if (res.error) {
      setLoading(false);
      return alert(res.error);
    }
    let limit = res?.data?.chargingSchedule?.chargingSchedulePeriod[0]?.limit / 1000 || "";
    setCurValue(limit);
    
    const chargerDetailsRes = await api.charger(id).get();
    setChargerDetails(chargerDetailsRes.data);
    setLoading(false);

  }
  

  useEffect(() => {
    setLoading(true)
    loadData()
    
    const intervalId = setInterval(() => {
      loadData()
    }, 7000)

    return () => {
      clearInterval(intervalId); 
    }
  }, [])

  if (loading){
    return (
      <Loading />
    )
  }
  else {
    return (
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title font-bold text-xl">{chargerDetails.id}</div>
          <div class="stat-value text-md pb-4">{chargerDetails.chargerName}</div>
          <div class="stat-title font-bold text-xl">Current Curtailment</div>
          <div class="stat-value">{curValue} {curValue ? 'kW' : 'Not Set'}</div>
        </div>
      </div>
    )
  }
}

export default CurtailmentInfo