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


  let levitonResData = [];
  let yaskawaResData = [];
  let primoResData = [];
  let symoResData = [];
  let sma7ResData = [];
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
    let levitonPage = 0;
    let _labels = []; // This just uses leviton's timestamps for the labels
    let _levitonData = [];

    while (levitonPage * pageSize <= maxData) {
      const res = await api.ems.leviton.get({ params: { page: levitonPage, pageSize: pageSize } })
      if (res.error) {
        setLoading(false)
        return alert(res.error);
      }
      if (levitonPage === 0) {
        newestLevitonPointDate = res.data[0].createdAt;
      }
      levitonPage++;
      levitonResData.push(...res.data)
      levitonResData.sort((a, b) => a.timestamp - b.timestamp);
      _levitonData = levitonResData.map(data => data.power).reverse();
      _labels = levitonResData.map(data => moment(data.updatedAt).format('LTS')).reverse();
      setLabels(_labels);
      setLevitonData(_levitonData);
      setLoading(false);
    }
  }

  const loadNewLeviton = async () => {
    let _labels = []; // This just uses leviton's timestamps for the labels
    let _levitonData = [];
    const res = await api.ems.leviton.get({params: {limit: 200, start: moment(newestLevitonPointDate).add(1, 'seconds')}});
    if (res.error){
      setLoading(false)
      return alert(res.error);
    }
    if (res.data && res?.data.length > 0) {
      newestLevitonPointDate = res.data[0].createdAt;
      levitonResData.unshift(...res.data)
      levitonResData.sort((a, b) => a.timestamp - b.timestamp)

      _levitonData = levitonResData.map(data => data.power).reverse();
      _labels = levitonResData.map(data => moment(data.updatedAt).format('LTS')).reverse();

      // removes oldest values
      if (_levitonData.length > maxData) {
        _levitonData = _levitonData.slice(_levitonData.length - maxData);
        _labels = _labels.slice(_labels.length - maxData);
      }


      setLevitonData(_levitonData)
      setLabels(_labels)
    }
  }

  const loadYaskawa = async () => {
    let yaskawaPage = 0;
    let _yaskawaData = [];
    while (yaskawaPage * pageSize <= maxData) {
      const res = await api.ems.yaskawa.get({ params: { page: yaskawaPage, pageSize: pageSize } })
      if (res.error) {
        setLoading(false);
        return alert(res.error);
      }
      if (yaskawaPage === 0) {
        newestYaskawaPointDate = res.data[0].createdAt;
      }
      yaskawaResData.push(...res.data)
      yaskawaResData.sort((a, b) => a.id - b.id)
      _yaskawaData = yaskawaResData.map(data => data.activeAcPower);
      setYaskawaData(_yaskawaData)
      yaskawaPage++;
    }
  };

  const loadNewYaskawa = async () => {
    let _yaskawaData = [];
    const res = await api.ems.yaskawa.get({params: {limit: 200, start: moment(newestYaskawaPointDate).add(1, 'seconds')}});
    if (res.error){
      setLoading(false);
      return alert(res.error);
    }
    if (res.data && res?.data.length > 0) {
      newestYaskawaPointDate = res.data[0].createdAt;
      yaskawaResData.push(...res.data);
      yaskawaResData.sort((a, b) => a.id - b.id);

      _yaskawaData = yaskawaResData.map(data => data.activeAcPower);

      // removes oldest values
      if (_yaskawaData.length > maxData) {
        _yaskawaData = _yaskawaData.slice(_yaskawaData.length - maxData);
      }

      setYaskawaData(_yaskawaData);
    }
  }

  const loadSymo = async () => {
    let symoPage = 0;
    let _symoData = [];
    while (symoPage * pageSize <= maxData) {
      const res = await api.ems.fronius.get({ params: { page: symoPage, pageSize: pageSize, model: 'symo' } })
      if (res.error) {
        setLoading(false);
        return alert(res.error);
      }
      if (symoPage === 0) {
        newestSymoPointDate = res.data[0].createdAt;
      }
      symoResData.push(...res.data);
      symoResData.sort((a, b) => a.id - b.id);
      _symoData = symoResData.map(data => data.acPower);
      setSymoData(_symoData);
      symoPage++;
    }
  };

  const loadNewSymo = async () => {
    let _symoData = [];
    const res = await api.ems.fronius.get({params: {model: 'symo', limit: 200, start: moment(newestSymoPointDate).add(1, 'seconds')}});
    if (res.error){
      setLoading(false);
      return alert(res.error);
    }
    if (res.data && res?.data.length > 0) {
      newestSymoPointDate = res.data[0].createdAt;
      symoResData.push(...res.data);
      symoResData.sort((a, b) => a.id - b.id);

      _symoData = symoResData.map(data => data.acPower);

      // removes oldest values
      if (_symoData.length > maxData) {
        _symoData = _symoData.slice(_symoData.length - maxData);
      }

      setSymoData(_symoData);
    }
  }

  const loadPrimo = async () => {
    let primoPage = 0;
    let _primoData = [];
    while (primoPage * pageSize <= maxData) {
      const res = await api.ems.fronius.get({ params: { page: primoPage, pageSize: pageSize, model: 'primo' } })
      if (res.error) {
        setLoading(false);
        return alert(res.error);
      }
      if (primoPage === 0) {
        newestPrimoPointDate = res.data[0].createdAt;
      }
      primoResData.push(...res.data);
      primoResData.sort((a, b) => a.id - b.id);
      _primoData = primoResData.map(data => data.acPower / 1000);
      setPrimoData(_primoData);
      primoPage++;
    }
  }

  const loadNewPrimo = async () => {
    let _primoData = [];
    const res = await api.ems.fronius.get({params: {model: 'primo', limit: 200, start: moment(newestPrimoPointDate).add(1, 'seconds')}});
    if (res.error){
      setLoading(false);
      return alert(res.error);
    }
    if (res.data && res?.data.length > 0) {
      newestPrimoPointDate = res.data[0].createdAt;
      primoResData.push(...res.data);
      primoResData.sort((a, b) => a.id - b.id);

      _primoData = primoResData.map(data => data.acPower / 1000);

      // removes oldest values
      if (_primoData.length > maxData) {
        _primoData = _primoData.slice(_primoData.length - maxData);
      }

      setPrimoData(_primoData);
    }
  }

  const loadSma50 = async () => {
    let sma50Page = 0;
    let _sma50Data = [];
    while (sma50Page * pageSize <= maxData) {
      const res = await api.ems.sma50.get({ params: { page: sma50Page, pageSize: pageSize } })
      if (res.error) {
        setLoading(false);
        return alert(res.error);
      }
      if (sma50Page === 0) {
        newestSma50PointDate = res.data[0].createdAt;
      }
      sma50ResData.push(...res.data);
      sma50ResData.sort((a, b) => a.id - b.id);
      _sma50Data = sma50ResData.map(data => data.acPower);
      setSma50Data(_sma50Data);
      sma50Page++;
    }
  }

  const loadNewSma50 = async () => {
    let _sma50Data = [];
    const res = await api.ems.sma50.get({params: {limit: 200, start: moment(newestSma50PointDate).add(1, 'seconds')}});
    if (res.error){
      setLoading(false);
      return alert(res.error);
    }
    if (res.data && res?.data.length > 0) {
      newestSma50PointDate = res.data[0].createdAt;
      sma50ResData.push(...res.data);
      sma50ResData.sort((a, b) => a.id - b.id);

      _sma50Data = sma50ResData.map(data => data.acPower);

      // removes oldest values
      if (_sma50Data.length > maxData) {
        _sma50Data = _sma50Data.slice(_sma50Data.length - maxData);
      }

      setSma50Data(_sma50Data);
    }
  }

  const loadSma7 = async () => {
    let sma7Page = 0;
    let _sma7Data = [];
    while (sma7Page * pageSize <= maxData) {
      const res = await api.ems.sma7.get({ params: { page: sma7Page, pageSize: pageSize } })
      if (res.error) {
        setLoading(false);
        return alert(res.error);
      }
      if (sma7Page === 0) {
        newestSma7PointDate = res.data[0].createdAt;
      }
      sma7ResData.push(...res.data);
      sma7ResData.sort((a, b) => a.id - b.id);
      _sma7Data = sma7ResData.map(data => data.acPower);
      setSma7Data(_sma7Data);
      sma7Page++;
    }
  }

  const loadNewSma7 = async () => {
    let _sma7Data = [];
    const res = await api.ems.sma7.get({params: {limit: 200, start: moment(newestSma7PointDate).add(1, 'seconds')}});
    if (res.error){
      setLoading(false);
      return alert(res.error);
    }
    if (res.data && res?.data.length > 0) {
      newestSma7PointDate = res.data[0].createdAt;
      sma7ResData.push(...res.data);
      sma7ResData.sort((a, b) => a.id - b.id);

      _sma7Data = sma7ResData.map(data => data.acPower);

      // removes oldest values
      if (_sma7Data.length > maxData) {
        _sma7Data = _sma7Data.slice(_sma7Data.length - maxData);
      }

      setSma7Data(_sma7Data);
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
      loadNewLeviton();
      loadNewYaskawa();
      loadNewSymo();
      loadNewPrimo();
      loadNewSma50();
      loadNewSma7();
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