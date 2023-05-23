import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../../api"
import Loading from "../../components/Loading"
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
} from "chart.js"
import { Line } from "react-chartjs-2";
import moment from "moment"

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
)

export const options = {
  animation: {
    duration: 0
  },
  plugins: {
    legend: {
      position: 'top',
    },
  },
  scales: {
    y: {
      min: 0,
      max: 100,
    },
  },
  maintainAspectRatio: true,
}




const VircitiBus = () => {
  const { id } = useParams()
  const [bus, setBus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState({});

  
  const loadData = async () => {
    const busesRes = await api.bus.viriciti.get({params: {vid: id}});
    if (busesRes.error){
      setLoading(false)
      return alert(busesRes.error)
    }
    let bus = {}
    if (busesRes.data)
      bus = busesRes.data
    let current = null
    try {
      const currentRes = await api.bus.viriciti.current({params: {vid: bus.vid, limit: 1}});

      if (!currentRes.error) {
        current = currentRes.data[0].value
      }
    }
    catch{}
    bus.current = current

 

    let gps = {
      lat: null,
      long: null
    }
    try {
      let soc = null
      let currentSOC = null
      try{
        const socRes = await api.bus.viriciti.soc({params: {vid: bus.vid, limit: 500}});

        if (!socRes.error) {
          currentSOC = socRes.data[0].value
          soc = socRes.data
        }
      } catch{}
      bus.soc = currentSOC

      const data = soc.map(step => step.value).reverse();
      const labels = soc.map(step => moment(step.time).format('MM-DD HH:mm:ss')).reverse();

  
      setChartData({
        labels: labels,
        datasets: [
          {
            label: "SOC",
            data: data,
            borderColor: 'rgba(75,192,192,1)',
            backgroundColor: 'rgba(75,192,192,0.1)'
          },
        ]
      })


      const gpsRes = await api.bus.viriciti.gps({params: {vid: bus.vid, limit: 1}});

      if (!gpsRes.error) {
        gps.lat = gpsRes.data[0].lat
        gps.long = gpsRes.data[0].long
      }
    } catch{}
    bus.latitude = gps.lat
    bus.longitude = gps.long
    
    let odo = null
    try {
      const odoRes = await api.bus.viriciti.odo({params: {vid: bus.vid, limit: 1}});
      if (!odoRes.error) {
        odo = odoRes.data[0].value
      }
    } catch{}
    bus.odo = odo


    let power = null
    try {
      const powerRes = await api.bus.viriciti.power({params: {vid: bus.vid, limit: 1}});

      if (!powerRes.error) {
        power = powerRes.data[0].value
      }
    } catch{}
    bus.power = power



    let speed = null
    try {
      const speedRes = await api.bus.viriciti.speed({params: {vid: bus.vid, limit: 1}});

      if (!speedRes.error) {
        speed = speedRes.data[0].value
      }
    } catch{}
    bus.speed = speed


    let voltage = null
    try {
      const voltRes = await api.bus.viriciti.voltage({params: {vid: bus.vid, limit: 1}});

      if (!voltRes.error) {
        voltage = voltRes.data[0].value
      }
    } catch{}
    bus.voltage = voltage


    let energyUsedPerDay = null
    try {
      const energyPerDayRes = await api.bus.viriciti.energyUsedPerDay({params: {vid: bus.vid, limit: 1}});

      if (!energyPerDayRes.error) {
        energyUsedPerDay = energyPerDayRes.data[0].value
      }
    } catch{}
    bus.energyUsedPerDay = energyUsedPerDay
    setBus(bus)
    setLoading(false);
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="prose md:container md:mx-auto mx-auto mb-8">
      <h1 className="text-4xl font-bold mb-8">{id}</h1>
      {loading && <Loading/>}
      {!loading &&
      <>
      <div className="w-full h-full">
        <Line
          datasetIdKey='id'
          data={chartData}
          options={options}
          redraw={false}
          height={"100px"}
        />
      </div>
      <div className="flex flex-col"> 
        <div className="stats shadow my-8">
          <div className="stat place-items-center">
            <div className="stat-title">State of Charge</div>
            <div className="stat-value">{bus.soc}%</div>
          </div>
        </div>

        <div className="stats shadow mb-8">
          <div className="stat place-items-center">
            <div className="stat-title">Current</div>
            <div className="stat-value">{parseFloat(bus.current).toFixed(2)}</div>
          </div>
          
          <div className="stat place-items-center">
          <div className="stat-title">Voltage</div>
            <div className="stat-value">{parseFloat(bus.voltage).toFixed(2)}</div>
          </div>
          
          <div className="stat place-items-center">
            <div className="stat-title">Power</div>
            <div className="stat-value">{parseFloat(bus.power).toFixed(2)}</div>
          </div>
        </div>


        <div className="stats shadow mb-8">
          <div className="stat place-items-center">
            <div className="stat-title">Odometer</div>
            <div className="stat-value">{parseFloat(bus.odo).toFixed(2)}</div>
          </div>
          <div className="stat place-items-center">
            <div className="stat-title">Speed</div>
            <div className="stat-value">{parseFloat(bus.speed).toFixed(2)}</div>
          </div>
          <div className="stat place-items-center">
            <div className="stat-title">Energy usage per day</div>
            <div className="stat-value">{parseFloat(bus.energyUsedPerDay).toFixed(2)}</div>
          </div>
        </div>


      </div>
      </>
      }
    </div>
  )
}

export default VircitiBus