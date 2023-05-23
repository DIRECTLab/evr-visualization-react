
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
import api from "../../../api";
import Loading from "../../Loading";
import { getCoreRowModel, getSortedRowModel, useReactTable, flexRender } from "@tanstack/react-table";

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
  const [daysToSearch, setDaysToSearch] = useState(20)


  // CHART SETUP and DATA
  const loadData = async () => {
    const busesRes = await api.newflyer.specific(id).getAllRoutes(daysToSearch);
    if (busesRes.error){
      setLoading(false)
      return alert(busesRes.error)
    }
    setBuses(busesRes.data)
    setAllBuses(busesRes.data)
    console.log(busesRes.data)

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
    console.log(socData)

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
    
  }


  // TABLE SETUP
  const columns = [
    {
      accessorKey: 'speed',
      cell: info => Math.round(info.getValue() * 100) / 100,
      header: () => <span>Speed</span>,
    },
    {
      accessorKey: 'dcEnergyConsumptionKwh',
      cell: info => Math.round(info.getValue() * 100) / 100,
      header: () => <span>DC Consumption Kwh</span>,
    },
    {
      accessorKey: 'directionReference',
      cell: info => info.getValue(),
      header: () => <span>Direction</span>,
    },
    {
      accessorKey: 'latitude',
      cell: info => info.getValue(),
      header: () => <span>Latitude</span>,
    },
    {
      accessorKey: 'longitude',
      cell: info => info.getValue(),
      header: () => <span>Longitude</span>,
    },
    {
      accessorKey: 'soc',
      cell: info => Math.round(info.getValue() * 100) / 100,
      header: () => <span>SOC</span>,
    },
    {
      accessorKey: 'lineName',
      cell: info => info.getValue(),
      header: () => <span>Line Name</span>,
    },
    {
      accessorKey: 'timeToEmpty',
      cell: info => Math.round(info.getValue() * 100) / 100,
      header: () => <span>Time to Empty</span>,
    },
    {
      accessorKey: 'totalVehicleDistance',
      cell: info => Math.round(info.getValue() * 100) / 100,
      header: () => <span>Total Distance</span>,
    },
    {
      accessorFn: row => moment(row.createdAt).format('lll'),
      cell: info => info.getValue(),
      header: () => <span>GPS Fix Time</span>,
      id: 'gpsFixTime',
    },
  ]

  const updateFilter = () => {
    if (searchFilter === ''){
      return setBuses(allBuses)
    }

    const filtered = allBuses().filter(value => {
      for (let key of Object.keys(value)){
        if (key === 'gpsFixTime' && moment(`${value[key]}`).format('lll').includes(searchFilter)){
          return true
        }
        if (`${value[key]}`.toLowerCase().includes(searchFilter.toLowerCase())){
          return true
        }
      }
      return false
    })
    setBuses(filtered)
  }

  const table = useReactTable({
    data: buses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  useEffect(() => {
    setLoading(true)
    loadData()
    
    // const intervalId = setInterval(() => {
    //   loadData()
    // }, 7000)

    // return () => {
    //   clearInterval(intervalId); 
    // }
  }, [])
  // 

  if (loading) {
    return (
      <Loading />
    )
  }
  else {
    return(
      <>
        {/* CHART */}
        <div className="w-full h-full">
          <Line
            datasetIdKey='id'
            data={chartData}
            options={options}
            redraw={false}
            height={"100px"}
          />
        </div>
        {/* TABLE */}
        <div className="w-full">
          <div className="form-control w-full max-w-xs mb-8">
            <label className="label">
              <span className="label-text text-lg">Search for a bus</span>
            </label>
            <input type="text" placeholder="Search" onInput={(e) => {setSearchFilter(e.target.value); updateFilter()}} className="input input-bordered w-full max-w-xs" />
          </div>
          <div className="overflow-x-auto w-full h-96">
            <table className="table table-zebra w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup, header_group_id) => (
                  <tr className="sticky top-0" key={header_group_id}>
                  {headerGroup.headers.map((header, header_id) => (
                      <th key={`header-${header_id}-header-group-${header_group_id}`}>
                        {header.isPlaceholder ? null : <div className={ header.column.getCanSort() ? 'cursor-pointer select-none' : ''} >{flexRender(header.column.columnDef.header, header.getContext())}</div>}
                        {{ asc: <i className="fa-solid fa-arrow-down"></i>, desc: <i className="fa-solid fa-arrow-up"></i> }[header.column.getIsSorted()] ?? null}
                      </th>
                  ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row, rowIndex) => (
                  <tr
                    className="hover cursor-pointer select-none"
                    key={rowIndex}
                  >
                    {row.getVisibleCells().map((cell, colIndex) => (
                      <td key={`charger-table-${rowIndex}-${colIndex}`}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>

    )
  }
}

export default SpecificBus