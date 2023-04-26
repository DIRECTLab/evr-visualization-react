import React from "react";
import { useEffect, useState } from "react"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Loading from "../components/Loading";
import api from "../api";



const Map = () => {


  const [center, setCenter] = useState([41.2230, -111.9738])
  const [buses, setBuses] = useState([])
  const [chargerInformation, setChargerInformation] = useState([])
  const [loading, setLoading] = useState(true)

  const busIcon = L.icon({
    iconUrl: 'busIcon.png',
    iconSize: [40, 30]
  })

  const chargerIcon = L.icon({
    iconUrl: 'chargerIcon.png',
    iconSize: [30, 30]
  })

  const getChargers = async () => {
		const chargersRes = await api.getChargers()
		if (chargersRes.error) {
			return alert(chargersRes.error)
		}
		let chargerInformation = chargersRes.data.map(data => {
			if (data.id !== null && data.latitude !== null && data.longitude !== null) {
				let dataObject = {
					"id": data.id,
					"latitude": data.latitude,
					"longitude": data.longitude
				}
				return dataObject
			}
		})
		chargerInformation = chargerInformation.filter((element) => {
   		return element !== undefined;
		});
    setChargerInformation(chargerInformation)
	}
  
  
  
  const loadData = async () => {
    getChargers()
    // Vericiti Busses
    const busesRes = await api.viriciti.getAll();
    if (busesRes.error){
      setLoading(false)
      return alert(busesRes.error)
    }
    const output = await Promise.all(busesRes.data.map(async (bus) => {
      let lat = null
      let long = null
      try {
        const gpsRes = await api.viriciti.specific(bus.vid, 1).getGPS()
        if (!gpsRes.error) {
          lat = gpsRes.data[0].lat
          long = gpsRes.data[0].long
        }
      } catch{}

      let soc = null
      try {
        const socRes = await api.viriciti.specific(bus.vid, 1).getSOC()
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
    const newFlyerRes = await api.newflyer.getAll()
    if (newFlyerRes.error) {
      setLoading(false)
    }
    const flyerOutput = await Promise.all(newFlyerRes.data.map(async (bus) => {
      let lat = null
      let long = null
      let soc = null
      try {
        const specificBusRes = await api.newflyer.specific(bus.id).getRoute()
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
      <MapContainer center={center} zoom={13} style={{height: '75rem'}}>
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
        { chargerInformation.map((charger, idx) => (
          <Marker position={[charger.latitude, charger.longitude]} icon={chargerIcon} key={idx}>
            <Popup>
              Charger id: {charger.id}<br />
            </Popup>
          </Marker>
        )
        )}
    </MapContainer>
    )
  }
}

export default Map