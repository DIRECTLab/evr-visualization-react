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

const maxData = 1000;
const pageSize = 100;




const MonitorChart = () => {
  let newestLevitonPointDate = null;
  let newestYaskawaPointDate = null;
  let newestPrimoPointDate = null;
  let newestSymoPointDate = null;
  let newestSma7PointDate = null;
  let newestSma50PointDate = null;

  let levitonPage = 0;
  let _labels = []; // This just uses leviton's timestamps for the labels
  let _levitonData = [];
  let levitonResData = [];

  let yaskawaPage = 0;
  let _yaskawaData = [];
  let yaskawaResData = [];

  let primoPage = 0;
  let _primoData = [];
  let primoResData = [];

  let symoPage = 0;
  let _symoData = [];
  let symoResData = [];

  let sma7Page = 0;
  let _sma7Data = [];
  let sma7ResData = [];

  let sma50Page = 0;
  let _sma50Data = [];
  let sma50ResData = [];

  const firstRender = useRef(true);

  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true)
  const chartRef = useRef(null);

  const [labels, setLabels] = useState([]);
  const [levitonData, setLevitonData] = useState([]);

  const [yaskawaData, setYaskawaData] = useState([]);
  const [symoData, setSymoData] = useState([]);
  const [primoData, setPrimoData] = useState([]);
  const [sma7Data, setSma7Data] = useState([]);
  const [sma50Data, setSma50Data] = useState([]);

  const [sumData, setSumData] = useState([]);
  const [facilityData, setFacilityData] = useState([]);


  const loadLeviton = async () => {
    while (levitonPage * pageSize < maxData) {
      const res = await api.ems.leviton.get({ params: { page: levitonPage, pageSize: pageSize } })
      levitonPage++;
      if (res.error) {
        return setLoading(false)
      }
      levitonResData.push(...res.data);
      levitonResData.sort((a, b) => a.id - b.id);
      _levitonData = levitonResData.map(data => data.power).reverse();
      _labels = levitonResData.map(data => moment(data.updatedAt).format('LTS')).reverse();
      setLabels(_labels);
      setLevitonData(_levitonData);
      setLoading(false);
    }
  }

  const loadNewLeviton = async () => {

  }

  const loadYaskawa = async () => {
    while (yaskawaPage * pageSize < maxData) {
      const res = await api.ems.yaskawa.get({ params: { page: yaskawaPage, pageSize: pageSize } })
      if (res.error) {
        setLoading(false)
      }
      yaskawaResData.push(...res.data)
      yaskawaResData.sort((a, b) => a.id - b.id)
      _yaskawaData = yaskawaResData.map(data => data.activeAcPower);
      setYaskawaData(_yaskawaData)
      yaskawaPage++;
    }
  };

  const loadSymo = async () => {
    while (symoPage * pageSize < maxData) {
      const res = await api.ems.fronius.get({ params: { page: symoPage, pageSize: pageSize, model: 'symo' } })
      if (res.error) {
        setLoading(false)
      }
      symoResData.push(...res.data);
      symoResData.sort((a, b) => a.id - b.id);
      _symoData = symoResData.map(data => data.acPower);
      setSymoData(_symoData);
      symoPage++;
    }
  };

  const loadPrimo = async () => {
    while (primoPage * pageSize < maxData) {
      const res = await api.ems.fronius.get({ params: { page: primoPage, pageSize: pageSize, model: 'primo' } })
      if (res.error) {
        setLoading(false);
      }
      primoResData.push(...res.data);
      primoResData.sort((a, b) => a.id - b.id);
      _primoData = primoResData.map(data => data.acPower / 1000);
      setPrimoData(_primoData);
      primoPage++;
    }
  }

  const loadSma50 = async () => {
    while (sma50Page * pageSize < maxData) {
      const res = await api.ems.sma50.get({ params: { page: sma50Page, pageSize: pageSize } })
      if (res.error) {
        setLoading(false)
      }
      sma50ResData.push(...res.data);
      sma50ResData.sort((a, b) => a.id - b.id);
      _sma50Data = sma50ResData.map(data => data.acPower);
      setSma50Data(_sma50Data);
      sma50Page++;
    }
  }

  const loadSma7 = async () => {
    while (sma7Page * pageSize < maxData) {
      const res = await api.ems.sma7.get({ params: { page: sma7Page, pageSize: pageSize } })
      if (res.error) {
        setLoading(false)
      }
      sma7ResData.push(...res.data);
      sma7ResData.sort((a, b) => a.id - b.id);
      _sma7Data = sma7ResData.map(data => data.acPower);
      setSma7Data(_sma7Data);
      sma7Page++;
    }
  }

  useEffect(() => {
    setChartData({
      labels: labels,
      datasets: [
        {
          label: "Utility Power (kW)",
          data: levitonData,
          borderColor: 'rgba(40, 202, 64, 0.8)',
          backgroundColor: 'rgba(40, 202, 64, 0.1)'
        },
        {
          label: "Total Solar Power (kW)",
          data: sumData,
          borderColor: 'rgba(75,192,192,1)',
          backgroundColor: 'rgba(75,192,192,0.1)'
        },
        {
          label: "EVR Load (kW)",
          data: facilityData,
          borderColor: 'rgba(163, 27, 242, 0.8)',
          backgroundColor: 'rgba(163, 27, 242, 0.1)'
        }
      ]
    })

  }, [labels, levitonData, sumData, facilityData]);


  // Pulled from https://stackoverflow.com/questions/24094466/sum-two-arrays-in-single-iteration
  const sumArrays = (...arrays) => {
    const n = arrays.reduce((max, xs) => Math.max(max, xs.length), 0);
    const result = Array.from({ length: n });
    return result.map((_, i) => arrays.map(xs => xs[i] || 0).reduce((sum, x) => sum + x, 0));
  }

  useEffect(() => {
    // This is in charge of summing the solar data when one of them gets new information
    const arr = [yaskawaData, symoData, primoData, sma7Data, sma50Data];
    let sumArray = sumArrays(...arr);
    setSumData(sumArray);
  }, [yaskawaData, symoData, primoData, sma7Data, sma50Data]);

  useEffect(() => {
    const arr = [levitonData, sumData];
    let sumArray = sumArrays(...arr);
    setFacilityData(sumArray);
  }, [levitonData, sumData])

  useEffect(() => {
    if (firstRender.current) { // Have to do this due to React.StrictMode rerendering everything twice
      setLoading(true);
      loadLeviton();
      loadYaskawa();
      loadSymo();
      loadPrimo();
      loadSma50();
      loadSma7();
      firstRender.current = false;
    }

    const intervalId = setInterval(() => {
      // loadLeviton()
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
    return (
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