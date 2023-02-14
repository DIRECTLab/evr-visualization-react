import { useEffect, useRef, useState } from "react";
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
import api from "../../api";
import Loading from "../Loading";

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
}

const MonitorChart = () => {

  
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true)
  const chartRef = useRef(null);


  const sumSolarData = async () => {
    const yaskawaRes = await api.ems.yaskawa.getAll()
    if (yaskawaRes.error){
      setLoading(false)
    }

    const froniusModels = await api.ems.fronius.getModelNames()
    if (froniusModels.error) {
      setLoading(false)
    }

    
    const froniusData = await Promise.all(froniusModels.data.map(async (data) => {
      const res = await api.ems.fronius.specific(data.model).getModelData()
      if (res.error) {
        setLoading(false)
      }
      return res
    }))

    const sma7Data = await api.ems.sma7.getAll()
    if (sma7Data.error) {
      setLoading(false)
    }

    const sma50Data = await api.ems.sma50.getAll()
    if (sma50Data.error) {
      setLoading(false)
    }

    let sumArray = []
    for (let i = 0; i <= yaskawaRes.data.length - 1; i++) {
      let sum = 0
      sum += yaskawaRes.data[i].activeAcPower
      froniusData.map(models => sum += (models.data[i].acPower / 1000))

      sum += sma7Data.data[i].acPower
      sum += sma50Data.data[i].acPower
      sumArray.push(sum)
    }
    return sumArray
  }

  const loadData = async () => {
    const res = await api.getLeviton()
    if (res.error){
      return setLoading(false)
    }
    
    const labels = res.data.map(data => data.time)
    const data = res.data.map(data => data.power)


    let sumArray = await sumSolarData()


    let facPower = []
    for (let i = 0; i < sumArray.length - 1; i++) {
      let sum = (sumArray[i] + data[i]);
      facPower.push(sum);
    }
    console.log(facPower)


    setChartData({
      labels: labels,
      datasets: [
        {
          label: "Utility Power (kW)",
          data: data,
          borderColor: 'rgba(40, 202, 64, 0.8)',
          backgroundColor: 'rgba(40, 202, 64, 0.1)'
        },
        {
          label: "Total Solar Power (kW)",
          data: sumArray,
          borderColor: 'rgba(75,192,192,1)',
          backgroundColor: 'rgba(75,192,192,0.1)'
        },
        {
          label: "EVR Load (kW)",
          data: facPower,
          borderColor: 'rgba(163, 27, 242, 0.8)',
          backgroundColor: 'rgba(163, 27, 242, 0.1)'
        }
      ]
    })
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    loadData()
    
    const intervalId = setInterval(() => {
      loadData()
    }, 7000)

    return () => {
      clearInterval(intervalId); 
    }
  }, [])

  if (loading) {
    return (
      <Loading />
    )
  }
  else {
    return(
      <div className="w-full h-full">
        <Line
          datasetIdKey='id'
          data={chartData}
          options={options}
          ref={chartRef}
          redraw={false}
        />
      </div>
    )
  }

}

export default MonitorChart