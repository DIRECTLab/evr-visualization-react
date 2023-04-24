import React, { useEffect, useState } from "react";
import api from "../../api";
import Loading from "../Loading";


const UsuChargers = () => {
  const [loading, setLoading] = useState(true)
  const [chargers, setChargers] = useState([])
  const [manualControl, setManualControl] = useState(false)
  

  const loadData = async () => {
    // Get Charger curtailment Information
    const res = await api.getChargers();
    if (res.error){
        return alert(res.error) // TODO: Make an alert
    }

    const chargerData = await Promise.all(res.data.map(async charger => {
      const chargerRes = await api.charger(charger.id).getStatus();
      if (chargerRes.error) {
        alert(chargerRes.error)
      }
      else {
        return { ...charger, ...chargerRes.data };
      }
    }));

    const usuChargers = chargerData.filter((value) => {
      return value.ChargerId === "T175-IT1-3420-003" || value.ChargerId === "T175-IT1-3420-016";
    })


    await Promise.all(usuChargers.map(async charger => {
      const chargerProfileRes = await api.charger(charger.ChargerId).getChargeProfile();
      if (chargerProfileRes.error) {
        setLoading(false);
        return alert(chargerProfileRes.error);
      }
      let limit = chargerProfileRes?.data?.chargingSchedule?.chargingSchedulePeriod[0]?.limit / 1000 || "";
      charger.curtailmentLimit = limit;
      
      // Add manual control status to charger object
      const allChargerProfileRes = await api.charger(charger.ChargerId).getAllProfiles();
      if (allChargerProfileRes.error) {
        setLoading(false);
        return alert(chargerProfileRes.error);
      }
      charger.manualControl = chargerProfileRes.data.manualControl
      charger.cleared = chargerProfileRes?.data?.cleared
      
      // Get Meter Values
      // const transactionRes = await api.charger(charger.ChargerId).getCurrentTransaction();
      // if (!transactionRes.data.id) {
      //   charger.meterValue = ""
      // }
      // else {
      //   const meterValueRes = await api.charger(charger.ChargerId).meterValues(transactionRes.data.id).getMeterValues();
      //   if (meterValueRes.error) {
      //     setLoading(false)
      //     return alert(meterValueRes.error)
      //   }
      //   const meterValuesArray = meterValueRes.data[0].MeterValues;
      //   for (let i = meterValuesArray.length - 1; i >= 0; i--) {
      //     if (meterValuesArray[i].SampledValues[0].context === "Sample.Periodic") {
      //       charger.meterValue = meterValuesArray[i].SampledValues[2].value / 1000;
      //       charger.soc = meterValuesArray[i].SampledValues[0].value
      //       break;
      //     }
      //     else {
      //       charger.meterValue = ""
      //       charger.soc = ""
      //     }
      //   }    
      // }
    }));

    let inManualMode = false;
    for (let i = 0; i < usuChargers.length; i++) {
  
      if (usuChargers[i].manualControl && !usuChargers[i].cleared) {
        inManualMode = true;
      } 
    }
    setManualControl(inManualMode);

    setChargers(usuChargers);
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true)
    loadData()
    const intervalId = (() => {
      loadData()
    }, 7000)
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
              {/* {charger.meterValue &&
              <>
                <div className="stat-title font-bold text-xl">Meter Value</div>
                <div className="stat-value text-md pb-4">{charger.meterValue} {charger.meterValue ? 'kW' : 'No Data'}</div>
              </>
              } */}
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