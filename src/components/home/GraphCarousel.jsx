import React, { useEffect, useState } from "react";
import YaskawaPowerChart from "../charts/YaskawaPowerChart";
import api from "../../api";
import SMA50PowerChart from "../charts/SMA50PowerChart";
import SMA7PowerChart from "../charts/SMA7PowerChart";
import SymoPowerChart from "../charts/SymoPowerChart";
import PrimoPowerChart from "../charts/PrimoPowerChart";
import GustavVoltageChart from "../charts/GustavVoltageChart";
import Loading from "../Loading";

const GraphCarousel = () => {

  const [yaskawaStatus, setYaskawaStatus] = useState(true)
  const [sma50Status, setSma50Status] = useState(true)
  const [sma7Status, setSma7Status] = useState(true)
  const [symoStatus, setSymoStatus] = useState(true)
  const [primoStatus, setPrimoStatus] = useState(true)
  const [gustavStatus, setGustavStatus] = useState(true)

  const [loading, setLoading] = useState(true)

  const checkStatus = async () => {
    const yaskawaRes = await api.ems.yaskawa.getStatus()
    if (yaskawaRes.error) {
      return alert(yaskawaRes.error)
    }
    setYaskawaStatus(yaskawaRes.data.active)
    
    const sma50Res = await api.ems.sma50.getStatus()
    if (sma50Res.error) {
      return alert(sma50Res.error)
    }
    setSma50Status(sma50Res.data.active)

    const sma7Res = await api.ems.sma7.getStatus()
    if (sma7Res.error){
      return alert(sma7Res.error)
    }
    setSma7Status(sma7Res.data.active)

    const symoStatus = await api.ems.fronius.specific('symo').getStatus()
    if (symoStatus.error) {
      return alert(symoStatus.error)
    }
    setSymoStatus(symoStatus.data.active)

    const primoStatus = await api.ems.fronius.specific('primo').getStatus()
    if (primoStatus.error) {
      return alert(primoStatus.error)
    }
    setPrimoStatus(primoStatus.data.active)

    
    const gustavStatus = await api.ems.gustav_klein.getStatus()
    if (gustavStatus.error) {
      return alert(gustavStatus.error)
    }
    setGustavStatus(gustavStatus.data.active)

    setLoading(false)
  }


  useEffect(() => {
    checkStatus()
    const intervalId = setInterval(() => {
      checkStatus()
    }, 7000)
    return () => {
      clearInterval(intervalId); 
    }
  }, [])

  if (loading) {
    return <Loading />
  }
  else {

    return (
      <div className="carousel w-full">
        <div id="slide1" className="carousel-item relative w-full">
          <div className={`card w-1/3 shadow-xl mx-4 my-8 border-8 border-opacity-40 card-compact pt-1 ${(yaskawaStatus) ? 'border-success' : 'border-error'}`}>
            <h2 className="card-title mt-0 justify-center">Yaskawa</h2>
            <div className="card-body">
              <YaskawaPowerChart />
            </div>
          </div>
          <div className={`card w-1/3 shadow-xl mx-4 my-8 border-8 border-opacity-40 card-compact pt-1 ${sma50Status ? 'border-success' : 'border-error'}`} >
            <h2 className="card-title mt-0 justify-center">SMA50</h2>
            <div className="card-body">
              <SMA50PowerChart />
            </div>
          </div>
          <div className={`card w-1/3 shadow-xl mx-4 my-8 border-8 border-opacity-40 card-compact pt-1 ${sma7Status ? 'border-success' : 'border-error'}`}>
            <h2 className="card-title mt-0 justify-center">SMA7</h2>
            <div className="card-body">
              <SMA7PowerChart />
            </div>
          </div>

          <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
            <a href="#slide2" className="btn btn-circle bg-opacity-50 border-none">❮</a> 
            <a href="#slide2" className="btn btn-circle bg-opacity-50 border-none">❯</a>
          </div> 
        </div> 
        <div id="slide2" className="carousel-item relative w-full">

          <div className={`card w-1/3 shadow-xl mx-4 my-8 border-8 border-opacity-40 card-compact pt-1 ${symoStatus ? 'border-success' : 'border-error'}`}>
            <h2 className="card-title mt-0 justify-center">Symo</h2>
            <div className="card-body">
              <SymoPowerChart />
            </div>
          </div>
          
          <div className={`card w-1/3 shadow-xl mx-4 my-8 border-8 border-opacity-40 card-compact pt-1 ${primoStatus ? 'border-success' : 'border-error'}`}>
            <h2 className="card-title mt-0 justify-center">Primo</h2>
            <div className="card-body">
              <PrimoPowerChart />
            </div>
          </div>

          <div className={`card w-1/3 shadow-xl mx-4 my-8 border-8 border-opacity-40 card-compact pt-1 ${gustavStatus ? 'border-success' : 'border-error'}`}>
            <h2 className="card-title mt-0 justify-center">Gustav</h2>
            <div className="card-body">
              <GustavVoltageChart />
            </div>
          </div>
          <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
            <a href="#slide1" className="btn btn-circle bg-opacity-50 border-none">❮</a> 
            <a href="#slide1" className="btn btn-circle bg-opacity-50 border-none">❯</a>
          </div>
        </div>  
      </div>
    )
  }
}

export default GraphCarousel