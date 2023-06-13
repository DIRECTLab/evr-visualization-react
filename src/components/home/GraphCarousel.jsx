import React, { useEffect, useState } from "react";
import YaskawaPowerChart from "../charts/YaskawaPowerChart";
import api from "../../api";
import SMA50PowerChart from "../charts/SMA50PowerChart";
import SMA7PowerChart from "../charts/SMA7PowerChart";
import SymoPowerChart from "../charts/SymoPowerChart";
import PrimoPowerChart from "../charts/PrimoPowerChart";
import GustavVoltageChart from "../charts/GustavVoltageChart";
import Loading from "../Loading";
import {Swiper, SwiperSlide} from "swiper/react";
import "swiper/css";
import "swiper/css/bundle";
import { Autoplay, Pagination, Navigation } from "swiper";


const GraphCarousel = () => {

  const [yaskawaStatus, setYaskawaStatus] = useState(true)
  const [sma50Status, setSma50Status] = useState(true)
  const [sma7Status, setSma7Status] = useState(true)
  const [symoStatus, setSymoStatus] = useState(true)
  const [primoStatus, setPrimoStatus] = useState(true)
  const [gustavStatus, setGustavStatus] = useState(true)

  const [loading, setLoading] = useState(true)

  const checkStatus = async () => {
    const yaskawaRes = await api.ems.yaskawa.get({params: {alive: true}});
    if (yaskawaRes.error) {
      return alert(yaskawaRes.error)
    }
    setYaskawaStatus(yaskawaRes?.data.active ?? false)
    setLoading(false)
    
    const sma50Res = await api.ems.sma50.get({params: {alive: true}});
    if (sma50Res.error) {
      return alert(sma50Res.error)
    }
    setSma50Status(sma50Res?.data.active ?? false)

    const sma7Res = await api.ems.sma7.get({params: {alive: true}});
    if (sma7Res.error){
      return alert(sma7Res.error)
    }
    setSma7Status(sma7Res?.data.active ?? false)

    const symoStatus = await api.ems.fronius.get({params: {model: 'symo', alive: true}});
    if (symoStatus.error) {
      return alert(symoStatus.error)
    }
    setSymoStatus(symoStatus?.data.active ?? false)

    const primoStatus = await api.ems.fronius.get({params: {model: 'primo', alive: true}});
    if (primoStatus.error) {
      return alert(primoStatus.error)
    }
    setPrimoStatus(primoStatus?.data.active ?? false)

    
    const gustavStatus = await api.ems.gustav.get({params: {alive: true}});
    if (gustavStatus.error) {
      return alert(gustavStatus.error)
    }
    setGustavStatus(gustavStatus?.data.active ?? false)

  }


  useEffect(() => {
    checkStatus()
    const intervalId = setInterval(() => {
      checkStatus()
    }, 60000)
    return () => {
      clearInterval(intervalId); 
    }
  }, [])

  const params = {
    autoplay: {
      delay: 10000,
      disableOnInteraction: false,
    },
    pagination: {
      clickable: true,
    },
    slidesPerView: 3,
    spaceBetween: 8,
    slidesPerGroup: 3,
    navigation: true,
    loop: true,
    modules: [Autoplay, Pagination, Navigation],
    className: "w-full content-center items-center"
  }

  if (loading) {
    return <Loading />
  }
  else {
    return (
      <>
      <Swiper {...params} >
        <SwiperSlide>
          <div className={`card shadow-xl mx-4 my-8 border-8 border-opacity-40 card-compact pt-1 ${(yaskawaStatus) ? 'border-success' : 'border-error'}`}>
            <h2 className="card-title mt-0 justify-center">Yaskawa</h2>
            <div className="card-body">
              <YaskawaPowerChart />
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className={`card shadow-xl mx-4 my-8 border-8 border-opacity-40 card-compact pt-1 ${sma50Status ? 'border-success' : 'border-error'}`} >
            <h2 className="card-title mt-0 justify-center">SMA50</h2>
            <div className="card-body">
              <SMA50PowerChart />
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className={`card shadow-xl mx-4 my-8 border-8 border-opacity-40 card-compact pt-1 ${sma7Status ? 'border-success' : 'border-error'}`}>
            <h2 className="card-title mt-0 justify-center">SMA7</h2>
            <div className="card-body">
              <SMA7PowerChart />
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className={`card shadow-xl mx-4 my-8 border-8 border-opacity-40 card-compact pt-1 ${symoStatus ? 'border-success' : 'border-error'}`}>
            <h2 className="card-title mt-0 justify-center">Symo</h2>
            <div className="card-body">
              <SymoPowerChart />
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className={`card shadow-xl mx-4 my-8 border-8 border-opacity-40 card-compact pt-1 ${primoStatus ? 'border-success' : 'border-error'}`}>
            <h2 className="card-title mt-0 justify-center">Primo</h2>
            <div className="card-body">
              <PrimoPowerChart />
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className={`card shadow-xl mx-4 my-8 border-8 border-opacity-40 card-compact pt-1 ${gustavStatus ? 'border-success' : 'border-error'}`}>
            <h2 className="card-title mt-0 justify-center">Gustav</h2>
            <div className="card-body">
              <GustavVoltageChart />
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </>
    )
  }
}

export default GraphCarousel