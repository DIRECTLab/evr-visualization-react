import React from "react";
import { useEffect, useState } from "react"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Loading from "../Loading";
import api from "../../api";



const BusMap = () => {


  const [center, setCenter] = useState([41.2230, -111.9738])
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)

  const busIcon = L.icon({
    iconUrl: 'busIcon.png',
    iconSize: [40, 30]
  })
  


  const loadData = async () => {
    // Vericiti Busses
    const busesRes = await api.bus.viriciti.get();
    if (busesRes.error){
      setLoading(false)
      return alert(busesRes.error)
    }
    const output = await Promise.all(busesRes.data.map(async (bus) => {
      let lat = null
      let long = null
      try {
//        const gpsRes = await api.viriciti.specific(bus.vid, 1).getGPS()
        const gpsRes = await api.bus.viriciti.gps({params: {vid: bus.vid, limit: 1}})

        if (!gpsRes.error) {
          lat = gpsRes.data[0].lat
          long = gpsRes.data[0].long
        }
      } catch{}

      let soc = null
      try {
        const socRes = await api.bus.viriciti.soc({params: {vid: bus.vid, limit: 1}});
        if (!socRes.error) {
          soc = socRes.data[0].value
        }
      } catch{}
      if (lat && long) {
        bus.latitude = lat
        bus.longitude = long
        bus.soc = soc
        return bus
      }
    }))
    // 

    // New Flyer Busses
    const newFlyerRes = await api.bus.newFlyer.get()
    if (newFlyerRes.error) {
      setLoading(false)
    }
    const flyerOutput = await Promise.all(newFlyerRes.data.map(async (bus) => {
      let lat = null
      let long = null
      let soc = null
      try {
        const specificBusRes = await api.bus.newFlyer.routes({params: {id: bus.id, limit: 1}});
        
        lat = specificBusRes.data.lastRoute.latitude
        long = specificBusRes.data.lastRoute.longitude
        soc = specificBusRes.data.lastRoute.soc
      } catch{}

      bus.latitude = +lat
      bus.longitude = +long
      bus.soc = +soc
      bus.vid = bus.id
      return bus
    }))
    // 

    const allBuses = [
      ...output,
      ...flyerOutput
    ]

    const filtered = allBuses.filter(element => element)

    setBuses(filtered)

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
    return (
      <Loading />
    )
  } else {
    return (
      <MapContainer center={center} zoom={13} style={{height: '50rem'}}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> 
            contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        { buses.map((bus, idx) => (
            <Marker position={[bus.latitude, bus.longitude]} icon={busIcon} key={idx}>

              <Popup>
                Bus vehicle id: {bus.vid}<br />
                State of Charge: {bus.soc}%<br />
              </Popup>
            </Marker>
          )
        )}
    </MapContainer>
    )
  }
}

export default BusMap