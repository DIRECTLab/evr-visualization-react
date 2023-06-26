import { useEffect, useState } from "react";
import moment from "moment";

import api from "../../api";
import Loading from "../Loading";
import { LineChart } from "@tremor/react";

const maxData = 200;
const pageSize = 25;


const dataFormatter = (number) => `${Intl.NumberFormat("us").format(number).toString()}`;


const YaskawaPowerChart = () => {
  let newestPointDate = null;
  let currentPage = 0;
  let _data = [];
  let _labels = [];
  let resData = [];
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true)

  const [labels, setLabels] = useState([]);
  const [data, setData] = useState([]);


  const loadData = async () => {

    while (currentPage * pageSize < maxData) {
      const res = await api.ems.yaskawa.get({ params: { page: currentPage, pageSize: pageSize } })
      if (res.error) {
        setLoading(false)
      }
      if (currentPage === 0) {
        newestPointDate = res.data[0].createdAt;
      }
      resData.push(...res.data)
      resData.sort((a, b) => a.id - b.id)

      _data = resData.map(data => data.activeAcPower);
      _labels = resData.map(data => moment(data.updatedAt).format('LTS'));

      setLoading(false)

      setData(_data)
      setLabels(_labels)

      currentPage++;
    }
  }


  const loadNewData = async () => {
    // Get newest data starting from newestPointDate
    const res = await api.ems.yaskawa.get({ params: { limit: 200, start: moment(newestPointDate).add(1, 'seconds').toISOString() } });
    if (res.error) {
      setLoading(false)
    }
    if (res.data && res?.data.length > 0) {
      newestPointDate = res.data[0].createdAt;
      resData.push(...res.data)
      resData.sort((a, b) => a.id - b.id)

      _data = resData.map(data => data.activeAcPower);
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
    let _chartData = [];
    for (let i = 0; i < data.length; i++) {
      _chartData.push({
        date: labels[i],
        "Active AC Power": data[i],
      })
    }
    setChartData(_chartData);
  }, [labels, data])

  useEffect(() => {
    if (currentPage === 0) setLoading(true)
    loadData()

    const intervalId = setInterval(() => {
      loadNewData()
    }, 60000)

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
      <LineChart
        className="mt-6"
        data={chartData}
        index="date"
        categories={["Active AC Power"]}
        colors={["emerald"]}
        valueFormatter={dataFormatter}
        yAxisWidth={40}
        maxValue={30}
      />
    )
  }
}

export default YaskawaPowerChart