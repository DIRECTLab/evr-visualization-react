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
import api from "../../../api";
import Loading from "../../Loading";


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
    },
  },
  maintainAspectRatio: true,
  
}


const CurtailmentChart = ({id}) => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true)


  
  const loadData = async () => {
    const chargerProfileRes = await api.charger(id).getAllProfiles();
    if (chargerProfileRes.error){
      return
    }

    const allData = chargerProfileRes.data.reverse().map(data => ({
        label: moment(data.chargingSchedule.startSchedule).format('MMM DD h:mma'),
        sortKey: moment(data.chargingSchedule.startSchedule),
        data: data.chargingSchedule.chargingSchedulePeriod[0].limit / 1000,
    }))

    
    const allDataSorted = allData.sort((a, b) => a.sortKey - b.sortKey);
    
    const filteredData = allDataSorted.filter((data, index) => {
      return data.sortKey > moment().subtract(1, 'day') && data.data > 0
    })      

    const labels = filteredData.map(data => data.label)
    const data = filteredData.map(data => data.data)

    
    setChartData({
      labels: labels,
      datasets: [
        {
          label: "Curtailment (Max kW)",
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
          height={"75px"}
        />
      </div>
    )
  }
}

export default CurtailmentChart