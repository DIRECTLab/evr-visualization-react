import Loading from "../Loading";

import api from "../../api";
import { useEffect, useState } from "react";
import moment from "moment";

const CurrentUtilization = () => {
  const [totalSolar, setTotalSolar] = useState(null)
  const [voltageOutput, setVoltageOutput] = useState(null)
  const [facilityPower, setFacilityPower] = useState(null)

  const [loadingSolar, setLoadingSolar] = useState(true);
  const [loadingUtility, setLoadingUtility] = useState(true);
  const [loadingEVRLoad, setLoadingEVRLoad] = useState(true);


  const loadData = async () => {
    const levitonRes = await api.ems.leviton.get({params: {current: true}});
    if (levitonRes.error){
      return alert(levitonRes.error)
    }
    let vltgOutput = parseFloat(levitonRes.data.power)?.toFixed(2)
    
    setVoltageOutput(vltgOutput)
    setLoadingUtility(false);

    const yaskawaRes = await api.ems.yaskawa.get({params: {limit: 1}})
    if (yaskawaRes.error){
      return alert(yaskawaRes.error)
    }
    
    
    const froniusModels = await api.ems.fronius.get()
    if (froniusModels.error) {
      return alert(froniusModels.error) 
    }
    
    
    const froniusData = await Promise.all(froniusModels.data.map(async (data) => {
      const res = await api.ems.fronius.get({params: {model: data.model, limit: 1}})
      if (res.error) {
        return alert(res.error)
      }
      return res
    }))
    
    const sma7Data = await api.ems.sma7.get({params: {limit: 1}})
    if (sma7Data.error) {
      return alert(sma7Data.error)
    }
    
    const sma50Data = await api.ems.sma50.get({params: {limit: 1}})
    if (sma50Data.error) {
      return alert(sma50Data.error)
    }

    let sum = 0
    sum += yaskawaRes.data[0].activeAcPower

    froniusData.map(models => sum += (models.data[0].acPower / 1000))
    sum += sma7Data.data[0].acPower

    sum += sma50Data.data[0].acPower

    sum = sum.toFixed(2)
    setTotalSolar(sum)
    setLoadingSolar(false);
    

    let facPower = parseFloat(sum) + parseFloat(vltgOutput)
    facPower = facPower.toFixed(2)
    setFacilityPower(facPower)
    setLoadingEVRLoad(false);
    
  }
  
  
  useEffect(() => {
    loadData()
    const intervalId = setInterval(() => {
      loadData()
    }, 7000)
    return () => {
      clearInterval(intervalId)
    }
  }, [])
  return (
    <div className="justify-center text-center">
      <div className="stats shadow text-center">
        <div className="stat place-items-center">
          <div className="stat-title font-bold text-xl">Total Solar Power (kW)</div>
          {loadingSolar && <Loading />}
          <div className="stat-value text-md pb-4">{totalSolar}</div>
        </div>
        <div className="stat place-items-center">
          <div className="stat-title font-bold text-xl">Utility Power (kW)</div>
          {loadingUtility && <Loading />}
          <div className="stat-value text-md pb-4">{voltageOutput}</div>
        </div>
        <div className="stat place-items-center">
          <div className="stat-title font-bold text-xl">EVR Load (kW)</div>
          {loadingEVRLoad && <Loading />}
          <div className="stat-value text-md pb-4">{facilityPower}</div>
        </div>
      </div>
    </div>
  )
}

export default CurrentUtilization