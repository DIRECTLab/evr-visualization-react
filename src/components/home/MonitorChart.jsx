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
import moment from "moment";

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
      min: -80,
      max: 120,
    },
  },
  maintainAspectRatio: false,
}

const limit = 1000;

const MonitorChart = () => {
  
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true)
  const chartRef = useRef(null);

  const sumSolarData = async () => {
    const yaskawaRes = await api.ems.yaskawa.get({params: {limit: limit}})
    if (yaskawaRes.error){
      setLoading(false)
    }

    const froniusModels = await api.ems.fronius.get()
    if (froniusModels.error) {
      setLoading(false)
    }

    
    const froniusData = await Promise.all(froniusModels.data.map(async (data) => {
      const res = await api.ems.fronius.get({params: {model: data.model, limit: limit}})
      if (res.error) {
        setLoading(false)
      }
      return res
    }))

    const sma7Data = await api.ems.sma7.get({params: {limit: limit}})
    if (sma7Data.error) {
      setLoading(false)
    }

    const sma50Data = await api.ems.sma50.get({params: {limit: limit}})
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
    // Since data is sorted in descending order, we will need to reverse it
    return sumArray.reverse()
  }

  const loadData = async () => {
    const res = await api.ems.leviton.get({params: {limit: limit}})
    if (res.error){
      return setLoading(false)
    }
    

    const labels = res.data.map(data => moment(data.timestamp).format("MMM D hh:mm a"))
    const data = res.data.map(data => data.power)

    labels.reverse(); // Need to reverse it since its in descending order
    data.reverse(); // Needed to reverse it
    
    let sumArray = await sumSolarData()


    let facPower = []
    for (let i = 0; i < sumArray.length - 1; i++) {
      let sum = (sumArray[i] + data[i]);
      facPower.push(sum);
    }



    setChartData({
      labels: labels,
      datasets: [
        {
          label: "Utility Power (kW)",
          data: data.length > 0 ? data : [],
          borderColor: 'rgba(40, 202, 64, 0.8)',
          backgroundColor: 'rgba(40, 202, 64, 0.1)'
        },
        {
          label: "Total Solar Power (kW)",
          data: sumArray.length > 0 ? sumArray : [],
          borderColor: 'rgba(75,192,192,1)',
          backgroundColor: 'rgba(75,192,192,0.1)'
        },
        {
          label: "EVR Load (kW)",
          data: facPower.length > 0 ? facPower : [],
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
          height={"500px"}
        />
      </div>
    )
  }

}

export default MonitorChart