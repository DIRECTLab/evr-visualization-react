
import { useEffect, useRef, useState } from "react";
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
      max: 100,
    },
  },
  maintainAspectRatio: true,
}


const SpecificBus = ({id}) => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true)
  const [buses, setBuses] = useState([])
  const [allBuses, setAllBuses] = useState([])
  const [searchFilter, setSearchFilter] = useState('')
  const [sorting, setSorting] = useState([])
  const [time, setTime] = useState([])
  const [soc, setSoc] = useState([])
  const [daysToSearch, setDaysToSearch] = useState(3)


  // CHART SETUP and DATA
  const loadData = async () => {
    const busesRes = await api.newflyer.specific(id).getAllRoutes(daysToSearch);
    if (busesRes.error){
      setLoading(false)
      return alert(busesRes.error)
    }

    setBuses(busesRes.data)
    setAllBuses(busesRes.data)

    const socData = busesRes.data.reduce((prev, curr) => {
      if (prev.usedTimes.has(curr.gpsFixTime)){
        return prev
      }
      else{
        prev.socDataUnique.push(curr.soc);
        prev.usedTimes.add(curr.gpsFixTime);
        prev.timeData.push(moment(curr.gpsFixTime).format('M/D/YYYY h:mm::ss a'))
        return prev
      }
    }, {socDataUnique: [], timeData: [], usedTimes: new Set()});

    const data = socData.socDataUnique.reverse()
    const labels = socData.timeData.reverse()

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
    setLoading(false)


    // setSoc(data);
    // setTime(socData.timeData.reverse());
    
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
  // 

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
          height={"100px"}
        />
      </div>
    )
  }
}

export default SpecificBus