import React from "react";
import { useNavigate } from 'react-router-dom'

const EMS = () => {

  let navigate = useNavigate()
  const routeChange = (path) => {
    navigate(path)
  }

  return (
    <div className="prose md:container md:mx-auto mx-auto w-full h-screen">
      <h1 className="text-4xl font-bold mb-16">EMS</h1>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 mb-16">
        <div className="h-64 card rounded-box place-items-center btn border-none text-xl" onClick={() => routeChange('/ems/gustav-klein')}>Gustav-Klein</div>
        <div className="h-64 card rounded-box place-items-center btn border-none text-xl" onClick={() => routeChange('/ems/yaskawa')}>Yaskawa</div> 
        <div className="h-64 card rounded-box place-items-center btn border-none text-xl" onClick={() => routeChange('/ems/fronius')}>Fronius</div>
        <div className="h-64 card rounded-box place-items-center btn border-none text-xl" onClick={() => routeChange('/ems/sma50')}>SMA50</div>
        <div className="h-64 card rounded-box place-items-center btn border-none text-xl" onClick={() => routeChange('/ems/sma7')}>SMA7</div>
      </div>
    </div>
  )
}

export default EMS;