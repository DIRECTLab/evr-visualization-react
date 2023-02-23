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
    const busesRes = await api.viriciti.getAll();
    if (busesRes.error){
      setLoading(false)
      return alert(busesRes.error)
    }
    const output = await Promise.all(busesRes.data.map(async (bus) => {
      let lat = null
      let long = null
      try {
        const gpsRes = await api.viriciti.specific(bus.vid).getGPS()
        if (!gpsRes.error) {
          lat = gpsRes.data[0].lat
          long = gpsRes.data[0].long
        }
      } catch{}

      let soc = null
      try {
        const socRes = await api.viriciti.specific(bus.vid).getSOC()
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
    const filtered = output.filter(element => element)

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
                State of Charge: {bus.soc}<br />
              </Popup>
            </Marker>
          )
        )}
    </MapContainer>
    )
  }
}

export default BusMap