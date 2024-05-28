import { useEffect, useRef, useState } from "react";
import api from "../../api";
import Loading from "../Loading";
import moment, { max } from "moment";

import { Card, Title, LineChart } from "@tremor/react";



const dataFormatter = (number) =>
  `${Intl.NumberFormat("us").format(number).toString()}`;

const maxData = 1000;
const pageSize = 100;

const allSumData = [];
for (let i = 0; i < maxData / pageSize; i++) {
  allSumData.push([]);
}

const uniqueDates = new Set();

let _labels = new Array(maxData).fill("Loading..."); // This just uses leviton's timestamps for the labels
let _levitonData = new Array(maxData).fill(0);
let _sumData = new Array(maxData).fill(0);

let levitonRequestCount = 0;


const MonitorChart = () => {
  let newestLevitonPointDate = null;

  const firstRender = useRef(true);

  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true)

  const [labels, setLabels] = useState(new Array(maxData).fill("Loading..."));
  const [levitonData, setLevitonData] = useState(new Array(maxData).fill(0));

  const [sumData, setSumData] = useState([]);
  const [facilityData, setFacilityData] = useState([]);



  const loadLeviton = () => {
    setLoading(false);

    for (let i = 0; i < maxData / pageSize; i++) {
      api.ems.leviton.get({ params: { page: i, pageSize: pageSize } }).then(res => {
        levitonRequestCount++;

        if (levitonRequestCount === 1) {
          newestLevitonPointDate = res.data[0].timestamp
        }

        for (let j = 0; j < res.data.length; j++) {
          _levitonData[i * pageSize + j] = res.data[j].power;
          _labels[i * pageSize + j] = moment(res.data[j].timestamp).format('LTS');
        }

        setLevitonData([..._levitonData].reverse());
        setLabels([..._labels].reverse());
      });
    }
  }

  const loadNewLeviton = async () => {
    const res = await api.ems.leviton.get({ params: { limit: 10, start: moment(newestLevitonPointDate).add(1, 'seconds').toISOString() } });
    if (res.error) {
      alert(res.error);
    }
    if (res.data && res?.data.length > 0) {
      newestLevitonPointDate = res.data[0].timestamp;

      const newPowerData = [];
      const newTimeData = [];

      res.data.forEach(dataPoint => {
        if (!uniqueDates.has(dataPoint.timestamp)) {
          newPowerData.push(dataPoint.power);
          newTimeData.push(moment(dataPoint.timestamp).format('LTS'));
          uniqueDates.add(dataPoint.timestamp);
        }
      })
      _levitonData = [...newPowerData, ..._levitonData];
      _labels = [...newTimeData, ..._labels];


      _levitonData = _levitonData.slice(0, maxData);
      _labels = _labels.slice(0, maxData);

      setLevitonData([..._levitonData].reverse());
      setLabels([..._labels].reverse());
    }
  }

  const loadYaskawa = async () => {

    for (let i = 0; i < maxData / pageSize; i++) {
      api.ems.yaskawa.get({ params: { page: i, pageSize: pageSize } }).then(res => {
        for (let j = 0; j < res.data.length; j++) {
          _sumData[i * pageSize + j] += res.data[j].activeAcPower;
        }
        setSumData([..._sumData].reverse());
      });
    }
  };

  const loadSymo = async () => {
    for (let i = 0; i < maxData / pageSize; i++) {
      api.ems.fronius.get({ params: { page: i, pageSize: pageSize, model: 'symo' } }).then(res => {
        for (let j = 0; j < res.data.length; j++) {
          _sumData[i * pageSize + j] += res.data[j].acPower;
        }
        setSumData([..._sumData].reverse());
      });
    }
  };

  const loadPrimo = async () => {
    for (let i = 0; i < maxData / pageSize; i++) {
      api.ems.fronius.get({ params: { page: i, pageSize: pageSize, model: 'primo' } }).then(res => {
        for (let j = 0; j < res.data.length; j++) {
          _sumData[i * pageSize + j] += (res.data[j].acPower / 1000);
        }
        setSumData([..._sumData].reverse());
      });
    }
  }

  const loadSma50 = async () => {
    for (let i = 0; i < maxData / pageSize; i++) {
      api.ems.sma50.get({ params: { page: i, pageSize: pageSize } }).then(res => {
        for (let j = 0; j < res.data.length; j++) {
          _sumData[i * pageSize + j] += res.data[j].acPower;
        }
        setSumData([..._sumData].reverse());
      });
    }
  }


  const loadSma7 = async () => {
    for (let i = 0; i < maxData / pageSize; i++) {
      api.ems.sma7.get({ params: { page: i, pageSize: pageSize } }).then(res => {
        for (let j = 0; j < res.data.length; j++) {
          _sumData[i * pageSize + j] += res.data[j].acPower;
        }
        setSumData([..._sumData].reverse());
      });
    }
  }

  const loadNewSolarData = async () => {
    let newSolarData = new Array(maxData).fill(0);

    let requests = [];
    let yaskawaRequests = [];
    let symoRequests = [];
    let primoRequests = [];
    let sma50Requests = [];
    let sma7Requests = [];
    for (let i = 0; i < maxData / pageSize; i++) {
      yaskawaRequests.push(api.ems.yaskawa.get({ params: { page: i, pageSize: pageSize } }));
      symoRequests.push(api.ems.fronius.get({ params: { page: i, pageSize: pageSize, model: 'symo' } }));
      primoRequests.push(api.ems.fronius.get({ params: { page: i, pageSize: pageSize, model: 'primo' } }));
      sma50Requests.push(api.ems.sma50.get({ params: { page: i, pageSize: pageSize } }));
      sma7Requests.push(api.ems.sma7.get({ params: { page: i, pageSize: pageSize } }));
    }
    requests.push(yaskawaRequests);
    requests.push(symoRequests);
    requests.push(primoRequests);
    requests.push(sma50Requests);
    requests.push(sma7Requests);

    for (let requestIdx = 0; requestIdx < requests.length; requestIdx++) {
      await Promise.all(requests[requestIdx]).then((values) => {


        if (requestIdx === 0) { // Yaskawa data
          for (let i = 0; i < values.length; i++) {
            for (let j = 0; j < values[i].data.length; j++) {
              newSolarData[i * pageSize + j] += values[i].data[j].activeAcPower;
            }
          }
        } else if (requestIdx === 2) { // Primo data
          for (let i = 0; i < values.length; i++) {
            for (let j = 0; j < values[i].data.length; j++) {
              newSolarData[i * pageSize + j] += values[i].data[j].acPower / 1000;
            }
          }
        } else { // Sma50, Sma7, and Symo
          for (let i = 0; i < values.length; i++) {
            for (let j = 0; j < values[i].data.length; j++) {
              newSolarData[i * pageSize + j] += values[i].data[j].acPower;
            }
          }
        }
      })
    }
    let reversedNewSolarData = [...newSolarData].reverse();
    setSumData(reversedNewSolarData);


  }



  useEffect(() => {
    let chartData = [];
    for (let i = 0; i < maxData; i++) {
      chartData.push({
        date: labels[i],
        "Utility Power": levitonData[i],
        "Total Solar Power (kW)": sumData[i],
        "EVR Load (kW)": facilityData[i]
      })
    }
    setChartData(chartData);



  }, [labels, levitonData, sumData, facilityData]);



  // Pulled from https://stackoverflow.com/questions/24094466/sum-two-arrays-in-single-iteration
  const sumArrays = (...arrays) => {
    const n = arrays.reduce((max, xs) => Math.max(max, xs.length), 0);
    const result = Array.from({ length: n });
    return result.map((_, i) => arrays.map(xs => xs[i] || 0).reduce((sum, x) => sum + x, 0));
  }
  useEffect(() => {
    const arr = [levitonData, sumData];
    let sumArray = sumArrays(...arr);
    setFacilityData(sumArray);
  }, [levitonData, sumData])

  useEffect(() => {
    if (firstRender.current) { // Have to do this due to React.StrictMode rerendering everything twice
      setLoading(true);
      loadLeviton();
      loadSma50();
      loadSma7();
      loadYaskawa();
      loadSymo();
      loadPrimo();
      firstRender.current = false;
    }

    const intervalId = setInterval(() => {
      loadNewLeviton();
      loadNewSolarData();
    }, 30000)

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
      <>
        <Card className="bg-base-100 my-4 shadow-xl">
          <Title className="text-primary">EVR Monitor Chart</Title>
          <LineChart
            className="mt-6 h-96"
            data={chartData}
            index="date"
            categories={["Utility Power", "Total Solar Power (kW)", "EVR Load (kW)"]}
            colors={["emerald", "blue", "purple"]}
            valueFormatter={dataFormatter}
            yAxisWidth={40}
            minValue={-80}
            maxValue={120}
          />
        </Card>
        <div className="justify-center text-center">
          <div className="stats shadow text-center">
            <div className="stat place-items-center">
              <div className="stat-title font-bold text-xl">Utility Power (kW)</div>
              <div className="stat-value text-md pb-4">{isNaN(Number(levitonData.slice(-1)[0].toFixed(2))) === NaN ? '--' : Number(levitonData.slice(-1)[0].toFixed(2))}</div>
            </div>
            <div className="stat place-items-center">
              <div className="stat-title font-bold text-xl">Total Solar Power (kW)</div>
              <div className="stat-value text-md pb-4">{isNaN(Number(sumData.slice(-1)[0]).toFixed(2)) ? '--' : Number(sumData.slice(-1)[0]).toFixed(2)}</div>
            </div>
            <div className="stat place-items-center">
              <div className="stat-title font-bold text-xl">EVR Load (kW)</div>
              <div className="stat-value text-md pb-4">{isNaN(Number(facilityData.slice(-1)[0].toFixed(2))) === NaN ? '--' : Number(facilityData.slice(-1)[0].toFixed(2))}</div>
            </div>
          </div>
        </div>
      </>
    )
  }

}

export default MonitorChart
