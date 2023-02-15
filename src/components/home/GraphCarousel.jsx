import React, { useEffect, useState } from "react";
import YaskawaPowerChart from "../charts/YaskawaPowerChart";
import api from "../../api";

const GraphCarousel = () => {

  const [yaskawaStatus, setYaskawaStatus] = useState(true)
  const [loading, setLoading] = useState(true)

  const checkStatus = async () => {
    const yaskawaRes = await api.ems.yaskawa.getStatus()
    if (yaskawaRes.error) {
      return alert(yaskawaRes.error)
    }
    setYaskawaStatus(yaskawaRes.data.active)
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

  return (
    <div className="carousel w-full">
      <div id="slide1" className="carousel-item relative w-full">
      {/* ${'border-success' ? yaskawaStatus && !loading : 'border-error'} */}
        <div className={`card w-1/3 shadow-xl mx-4 my-8 border-8 border-opacity-40 card-compact pt-1 ${(yaskawaStatus) ? 'border-success' : 'border-error'}`}>
          <h2 className="card-title mt-0 justify-center">Yaskawa</h2>
          <div className="card-body">
            <YaskawaPowerChart />
          </div>
        </div>
        {/* <div className="card w-1/3 shadow-xl mx-4 my-8 border-8 border-opacity-40 card-compact pt-1" classList={{'border-success': sma50Status() && allLoaded(), 'border-error': !sma50Status() && allLoaded()}}>
          <h2 className="card-title mt-0 justify-center">SMA50</h2>
          <div className="card-body">
            <SMA50ACPowerChart />
          </div>
        </div>
        <div className="card w-1/3 shadow-xl mx-4 my-8 border-8 border-opacity-40 card-compact pt-1" classList={{'border-success':  sma7Status() && allLoaded(), 'border-error': !sma7Status() && allLoaded()}}>
          <h2 className="card-title mt-0 justify-center">SMA7</h2>
          <div className="card-body">
            <SMA7ACPowerChart />
          </div>
        </div>

        <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
          <a href="#slide2" className="btn btn-circle bg-opacity-50 border-none">❮</a> 
          <a href="#slide2" className="btn btn-circle bg-opacity-50 border-none">❯</a>
        </div> 
      </div> 
      <div id="slide2" className="carousel-item relative w-full">

        <div className="card w-1/3 shadow-xl mx-4 my-8 border-8 border-opacity-40 card-compact pt-1" classList={{'border-success': symoStatus() && allLoaded(), 'border-error': !symoStatus() && allLoaded()}}>
          <h2 className="card-title mt-0 justify-center">Symo</h2>
          <div className="card-body">
            <SymoAcPowerChart />
          </div>
        </div>
        <div className="card w-1/3 shadow-xl mx-4 my-8 border-8 border-opacity-40 card-compact pt-1" classList={{'border-success': primoStatus() && allLoaded(), 'border-error': !primoStatus() && allLoaded()}}>
          <h2 className="card-title mt-0 justify-center">Primo</h2>
          <div className="card-body">
            <PrimoAcPowerChart />
          </div>
        </div>

        <div className="card w-1/3 shadow-xl mx-4 my-8 border-8 border-opacity-40 card-compact pt-1" classList={{'border-success': gustavStatus() && allLoaded(), 'border-error': !gustavStatus() && allLoaded()}}>
          <h2 className="card-title mt-0 justify-center">Gustav</h2>
          <div className="card-body">
            <GustavVoltageChart />
          </div>
        </div>
        <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
          <a href="#slide1" className="btn btn-circle bg-opacity-50 border-none">❮</a> 
          <a href="#slide1" className="btn btn-circle bg-opacity-50 border-none">❯</a>
        </div>*/}
      </div>  
    </div>
  )
}

export default GraphCarousel