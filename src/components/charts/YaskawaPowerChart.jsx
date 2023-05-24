import { useEffect, useState } from "react";
import moment from "moment";
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
  scales: {
    y: {
      min: 0,
      max: 50,
    },
  },
  maintainAspectRatio: true,
}


const YaskawaPowerChart = () => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true)


  
  const loadData = async () => {
    const res = await api.ems.yaskawa.get({params: {limit: 100}})
    if (res.error){
      setLoading(false)
    }
    
    const labels = res.data.map(data => moment(data.updatedAt).format('LTS')).reverse()
    const data = res.data.map(data => data.activeAcPower).reverse()


    setChartData({
      labels: labels,
      datasets: [
        {
          label: "Active AC Power",
          data: data,
          borderColor: 'rgba(75,192,192,1)',
          backgroundColor: 'rgba(75,192,192,0.1)'
        },
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
          redraw={false}
          height={"300px"}
        />
      </div>
    )
  }
}

export default YaskawaPowerChart