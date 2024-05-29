import React, { useEffect, useState } from "react";
import api from "../../api";
import Loading from "../Loading";


const UsuChargers = () => {
  const [loading, setLoading] = useState(true)
  const [chargers, setChargers] = useState([])
  const [manualControl, setManualControl] = useState(false)
  

  const loadData = async () => {
    // Get Charger curtailment Information
    const charger03Res = await api.charger.get({params: {id: 'T175-IT1-3420-003'}});
    if (charger03Res.error){
        return alert(charger03Res.error);
    }

    const charger016Res = await api.charger.get({params: {id: "T175-IT1-3420-016"}});
    if (charger016Res.error) {
      return alert(charger016Res.error);
    }

    const chargers = [charger03Res.data, charger016Res.data];

    const chargerData = await Promise.all(chargers.map(async charger => {
      const chargerRes = await api.charger.status({params: {id: charger.id, recent: true}});
      if (chargerRes.error) {
        alert(chargerRes.error)
      }
      else {
        return { ...charger, ...chargerRes.data };
      }
    }));


    await Promise.all(chargerData.map(async charger => {
      const chargerProfileRes = await api.charger.profile({params: {id: charger.ChargerId, limit: 1}});
      if (chargerProfileRes.error) {
        setLoading(false);
        return alert(chargerProfileRes.error);
      }
      let limit = chargerProfileRes?.data[0]?.chargingSchedule?.chargingSchedulePeriod[0]?.limit / 1000 || "";
      charger.curtailmentLimit = limit;
      
      // Add manual control status to charger object
      charger.manualControl = chargerProfileRes.data.manualControl
      charger.cleared = chargerProfileRes?.data?.cleared
    }));

    let inManualMode = false;
    for (let i = 0; i < chargerData.length; i++) {
  
      if (chargerData[i].manualControl && !chargerData[i].cleared) {
        inManualMode = true;
      } 
    }
    setManualControl(inManualMode);

    setChargers(chargerData);
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true)
    loadData()
    const intervalId = (() => {
      loadData()
    }, 14000)
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  if (loading) {
    return (
      <Loading />
    )
  }
  else {
    return (
      <div className="flex flex-row gap-8 justify-center">
        {chargers.map(charger => (
          <div className="stats shadow" key={charger.ChargerId}>
            <div className="stat">
              <div className="stat-title font-bold text-xl">{charger.ChargerId}</div>
              <div className="stat-value text-md pb-4">{charger.chargerName}</div>
              <div className="stat-title font-bold text-xl">Current Curtailment</div>
              <div className="stat-value pb-4">{charger.curtailmentLimit} {charger.curtailmentLimit ? 'kW' : 'Not Set'}</div>
              <div className="stat-title font-bold text-xl">Status</div>
              <div className="stat-value text-md pb-4">{charger.status}</div>
              {charger.soc && 
              <>
                <div className="stat-title font-bold text-xl">Charge Level</div>
                <div className="stat-value text-md pb-4">{charger.soc} {charger.soc ? '%' : 'No Data'}</div>
              </>
              }
              {manualControl &&
                <>
                  <div className="stat-title font-bold text-xl">Manual Control</div>
                  <div className="stat-value text-md pb-4 text-error">{manualControl ? 'Active' : 'Not Active'}</div>
                </>
              }
            </div>
          </div>
        ))}
      </div>
    )
  }
  }

export default UsuChargers
