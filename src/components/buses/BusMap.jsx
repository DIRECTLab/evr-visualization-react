import React from "react";
import { useEffect, useState } from "react"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import 'leaflet/dist/leaflet.css'
import icon from 'leaflet/dist/images/marker-icon.png';
import L from 'leaflet'
import Loading from "../Loading";
import api from "../../api";
import { faBus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";



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
      if (lat && long) {
        bus.latitude = lat
        bus.longitude = long
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
              </Popup>
            </Marker>
          )
        )}
        {/* <Marker position={center}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker> */}
    </MapContainer>
    )
  }
}

export default BusMap