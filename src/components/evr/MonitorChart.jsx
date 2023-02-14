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

// export const options = {
//   responsive: true,
//   plugins: {
//     legend: {
//       position: 'top',
//     },
//   },
// }

const MonitorChart = () => {
  // const [chartData, setChartData] = useState({});

  // const [loading, setLoading] = useState(true)
  // const [firstRender, setFirstRender] = useState(true);
  // const [utilityPower, setUtilityPower] = useState([]);
  // const [solarPower, setSolarPower] = useState([]);
  // const [evrLoad, setEvrLoad] = useState([]);
  // const [labels, setLabels] = useState([]);
  // const chartRef = useRef(null);

  const [loading, setLoading] = useState(true);



    return (
      // <div>
      //   <text>YEET</text>
      // </div>
      <div className="flex m-4 justify-center items-center">
        <i className="fa-solid fa-spinner fa-spin text-4xl"></i>
      </div>
    )
    



}

export default MonitorChart
//   const sumSolarData = async () => {
//     const yaskawaRes = await api.ems.yaskawa.getAll()
//     if (yaskawaRes.error){
//       setLoading(false)
//     }

//     const froniusModels = await api.ems.fronius.getModelNames()
//     if (froniusModels.error) {
//       setLoading(false)
//     }

    
//     const froniusData = await Promise.all(froniusModels.data.map(async (data) => {
//       const res = await api.ems.fronius.specific(data.model).getModelData()
//       if (res.error) {
//         setLoading(false)
//       }
//       return res
//     }))

//     const sma7Data = await api.ems.sma7.getAll()
//     if (sma7Data.error) {
//       setLoading(false)
//     }

//     const sma50Data = await api.ems.sma50.getAll()
//     if (sma50Data.error) {
//       setLoading(false)
//     }

//     let sumArray = []
//     for (let i = 0; i <= yaskawaRes.data.length - 1; i++) {
//       let sum = 0
//       sum += yaskawaRes.data[i].activeAcPower
//       froniusData.map(models => sum += (models.data[i].acPower / 1000))

//       sum += sma7Data.data[i].acPower
//       sum += sma50Data.data[i].acPower
//       sumArray.push(sum)
//     }
//     return sumArray
//   }

//   const initialLoad = async () => {
//     const res = await api.getLeviton()
//     if (res.error){
//       console.log("Error!")
//       return setLoading(false)
//     }
    
//     const labels = res.data.map(data => data.time)
//     const data = res.data.map(data => data.power)

//     let sumArray = await sumSolarData()


//     let facPower = []
//     for (let i = 0; i < sumArray.length - 1; i++) {
//       let sum = (sumArray[i] + data[i]);
//       facPower.push(sum);
//     }

//     setLabels(labels);
//     setUtilityPower(data);
//     setSolarPower(sumArray);
//     setEvrLoad(facPower);

    
//     setLoading(false);
//   }


//   useEffect(() => {
//     console.log("Setting new values");
//     const newChartData = {
//       labels: labels,
//       datasets: [
//         {
//           label: "Utility Power (kW)",
//           data: utilityPower,
//           borderColor: 'rgba(40, 202, 64, 0.8)',
//           backgroundColor: 'rgba(40, 202, 64, 0.1)'
//         }, 
//         {
//           label: "Total Solar Power (kW)",
//           data: solarPower,
//           borderColor: 'rgba(75,192,192,1)',
//           backgroundColor: 'rgba(75,192,192,0.1)'
//         }, 
//         {
//           label: "EVR Load (kW)",
//           data: evrLoad,
//           borderColor: 'rgba(163, 27, 242, 0.8)',
//           backgroundColor: 'rgba(163, 27, 242, 0.1)'
//         }
//       ],
//     }

//     setChartData(newChartData);
//   }, [utilityPower, solarPower, evrLoad])


//   const loadData = async () => {
    
//     //console.log(facPower)

    

//     // const newChartData = {
//     //   labels: labels,
//     //   datasets: [
//     //     {
//     //       label: "Utility Power (kW)",
//     //       data: utilityPower,
//     //       borderColor: 'rgba(40, 202, 64, 0.8)',
//     //       backgroundColor: 'rgba(40, 202, 64, 0.1)'
//     //     }, 
//     //     {
//     //       label: "Total Solar Power (kW)",
//     //       data: solarPower,
//     //       borderColor: 'rgba(75,192,192,1)',
//     //       backgroundColor: 'rgba(75,192,192,0.1)'
//     //     }, 
//     //     {
//     //       label: "EVR Load (kW)",
//     //       data: evrLoad,
//     //       borderColor: 'rgba(163, 27, 242, 0.8)',
//     //       backgroundColor: 'rgba(163, 27, 242, 0.1)'
//     //     }
//     //   ],
//     // }

//     // setChartData(newChartData);
//     // setLoading(false);
//   }

//   useEffect(() => {
//     if (firstRender) {
//       console.log("Initial Load");
//       setLoading(true)
//       initialLoad();

//       setFirstRender(false);
//     }
//   }, [firstRender])


//   useEffect(() => {
//     // setLoading(true)
//     // loadData()

//     const loadData = async () => {
//       const currentUtilityPower = utilityPower;
//       const currentLabels = labels;
//       const currentSolarPower = solarPower;
//       const currentEvrLoad = evrLoad;

//       const nextUtilityPower = await api.getCurrentLeviton();
      
//       console.log(nextUtilityPower.data[0].power);
//       console.log(currentUtilityPower.length);



//       currentUtilityPower.pop()
//       currentUtilityPower.push(nextUtilityPower.data[0].power);

//       currentLabels.pop();
//       currentLabels.push(nextUtilityPower.data[0].time);
//       // const nextSolarPower = await api.();
//       // currentSolarPower.pop()
//       // currentSolarPower.push(nextSolarPower.data);

//       setUtilityPower(currentUtilityPower);
//       setLabels(currentLabels);

//     }
    
//     const intervalId = setInterval(() => {
//       loadData()
//     }, 7000)

//     return () => {
//         clearInterval(intervalId); 
//     }
//   }, [])

//   // useEffect(() => {
//   //   console.log(chartData);
//   // }, [chartData]);


//   else {
//     return(
//       <div className="w-full h-full">
//         <Line
//           datasetIdKey='id'
//           data={chartData}
//           options={{
//             responsive: true
//           }}
//           ref={chartRef}
//         />
//       </div>
//     )
//   }

// }

// export default MonitorChart