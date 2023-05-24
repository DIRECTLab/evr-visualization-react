import Loading from "../Loading";

import api from "../../api";
import { useEffect, useState } from "react";

const CurrentUtilization = () => {
  const [loading, setLoading] = useState(true)
  const [totalSolar, setTotalSolar] = useState(null)
  const [voltageOutput, setVoltageOutput] = useState(null)
  const [facilityPower, setFacilityPower] = useState(null)

  const loadData = async () => {
    const levitonRes = await api.ems.leviton.get({params: {current: true}});
    if (levitonRes.error){
      setLoading(false)
      return alert(levitonRes.error)
    }
    let vltgOutput = parseFloat(levitonRes.data.power)?.toFixed(2)
    setVoltageOutput(vltgOutput)
    
    const yaskawaRes = await api.ems.yaskawa.get({params: {limit: 1}})
    if (yaskawaRes.error){
      setLoading(false)
      return alert(yaskawaRes.error)
    }
    
    const froniusModels = await api.ems.fronius.get()
    if (froniusModels.error) {
      setLoading(false)
      return alert(froniusModels.error) 
    }
    
    
    const froniusData = await Promise.all(froniusModels.data.map(async (data) => {
      const res = await api.ems.fronius.get({params: {model: data.model, limit: 1}})
      if (res.error) {
        setLoading(false)
        return alert(res.error)
      }
      return res
    }))
    
    const sma7Data = await api.ems.sma7.get({params: {limit: 1}})
    if (sma7Data.error) {
      setLoading(false)
      return alert(sma7Data.error)
    }
    
    const sma50Data = await api.ems.sma50.get({params: {limit: 1}})
    if (sma50Data.error) {
      setLoading(false)
      return alert(sma50Data.error)
    }

    let sum = 0
    sum += yaskawaRes.data[0].activeAcPower

    froniusData.map(models => sum += (models.data[0].acPower / 1000))
    sum += sma7Data.data[0].acPower

    sum += sma50Data.data[0].acPower

    sum = sum.toFixed(2)
    setTotalSolar(sum)
    

    let facPower = parseFloat(sum) + parseFloat(vltgOutput)
    facPower = facPower.toFixed(2)
    setFacilityPower(facPower)
    
    setLoading(false)
  }
  
  
  useEffect(() => {
    setLoading(true)
    loadData()
    const intervalId = setInterval(() => {
      loadData()
    }, 7000)
    return () => {
      clearInterval(intervalId)
    }
  }, [])
  if (loading) {
    return(
      <Loading />
    )
  }
  return (
    <div className="justify-center text-center">
      <div className="stats shadow text-center">
        <div className="stat place-items-center">
          <div className="stat-title font-bold text-xl">Total Solar Power (kW)</div>
          <div className="stat-value text-md pb-4">{totalSolar}</div>
        </div>
        <div className="stat place-items-center">
          <div className="stat-title font-bold text-xl">Utility Power (kW)</div>
          <div className="stat-value text-md pb-4">{voltageOutput}</div>
        </div>
        <div className="stat place-items-center">
          <div className="stat-title font-bold text-xl">EVR Load (kW)</div>
          <div className="stat-value text-md pb-4">{facilityPower}</div>
        </div>
      </div>
    </div>
  )
}

export default CurrentUtilization