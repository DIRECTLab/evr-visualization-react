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
      max: 50,
    },
  },
  maintainAspectRatio: true,
}

const maxData = 200;
const pageSize = 25;

const SymoPowerChart = () => {
  let newestPointDate = null;
  let currentPage = 0;
  let _data = [];
  let _labels = [];
  
  let resData = [];
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true)
  const chartRef = useRef(null);

  const [labels, setLabels] = useState([]);
  const [data, setData] = useState([]);


  const loadData = async () => {
    while (currentPage * pageSize < maxData) {
      const res = await api.ems.fronius.get({ params: { page: currentPage, pageSize: pageSize, model: 'symo' } })
      if (res.error) {
        setLoading(false)
      }
      if (currentPage === 0) {
        newestPointDate = res.data[0].createdAt;
      }
      resData.push(...res.data)
      resData.sort((a, b) => a.id - b.id)

      _data = resData.map(data => data.acPower);
      _labels = resData.map(data => moment(data.updatedAt).format('LTS'));

      setLoading(false)

      setData(_data)
      setLabels(_labels)

      currentPage++;
    }
  }

  useEffect(() => {
    setChartData({
      labels: labels,
      datasets: [
        {
          label: "AC Power",
          data: data,
          borderColor: 'rgba(75,192,192,1)',
          backgroundColor: 'rgba(75,192,192,0.1)'
        },
      ]
    })
  }, [labels, data])

  const loadNewData = async () => {
    // Get newest data starting from newestPointDate
    const res = await api.ems.fronius.get({ params: { limit: 200, start: moment(newestPointDate).add(1, 'seconds'), model: 'symo' } });
    if (res.error) {
      setLoading(false)
    }
    if (res.data && res?.data.length > 0) {
      newestPointDate = res.data[0].createdAt;
      resData.push(...res.data)
      resData.sort((a, b) => a.id - b.id)

      _data = resData.map(data => data.acPower);
      _labels = resData.map(data => moment(data.updatedAt).format('LTS'));

      // removes oldest values
      if (_data.length > maxData) {
        _data = _data.slice(_data.length - maxData);
        _labels = _labels.slice(_labels.length - maxData);
      }


      setData(_data)
      setLabels(_labels)
    }
  }

  useEffect(() => {
    setLoading(true)
    loadData()
    
    const intervalId = setInterval(() => {
      loadNewData()
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
          height={"300px"}
        />
      </div>
    )
  }
}

export default SymoPowerChart