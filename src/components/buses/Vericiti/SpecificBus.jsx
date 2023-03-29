
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
  const [daysToSearch, setDaysToSearch] = useState(3)


  // CHART SETUP and DATA
  const loadData = async () => {
    const busesRes = await api.viriciti.specific(id).getBus();
    if (busesRes.error) {
      setLoading(false)
      return alert(busesRes.error)
    }

    const output = await Promise.all([busesRes.data].map(async (bus) => {
      // Get current
      let current = null
      try {
        const currentRes = await api.viriciti.specific(bus.vid).getCurrent()
        if (!currentRes.error) {
          current = currentRes.data[0].value
        }
      }
      catch{}
      bus.current = current
      // 

      // get gps data
      let gps = {
        lat: null,
        long: null
      }
      try {
        const gpsRes = await api.viriciti.specific(bus.vid).getGPS()
        if (!gpsRes.error) {
          gps.lat = gpsRes.data[0].lat
          gps.long = gpsRes.data[0].long
        }
      } catch{}
      bus.latitude = gps.lat
      bus.longitude = gps.long
      
      let odo = null
      try {
        const odoRes = await api.viriciti.specific(bus.vid).getOdo()
        if (!odoRes.error) {
          odo = odoRes.data[0].value
        }
      } catch{}
      bus.odo = odo


      let power = null
      try {
        const powerRes = await api.viriciti.specific(bus.vid).getPower()
        if (!powerRes.error) {
          power = powerRes.data[0].value
        }
      } catch{}
      bus.power = power


      let soc = null
      try{
        const socRes = await api.viriciti.specific(bus.vid).getSOC()
        if (!socRes.error) {
          soc = socRes.data[0].value
        }
      } catch{}
      bus.soc = soc

      let speed = null
      try {
        const speedRes = await api.viriciti.specific(bus.vid).getSpeed()
        if (!speedRes.error) {
          speed = speedRes.data[0].value
        }
      } catch{}
      bus.speed = speed


      let voltage = null
      try {
        const voltRes = await api.viriciti.specific(bus.vid).getVoltage()
        if (!voltRes.error) {
          voltage = voltRes.data[0].value
        }
      } catch{}
      bus.voltage = voltage


      let energyUsedPerDay = null
      try {
        const energyPerDayRes = await api.viriciti.specific(bus.vid).getEnergyUsedPerDay()
        if (!energyPerDayRes.error) {
          energyUsedPerDay = energyPerDayRes.data[0].value
        }
      } catch{}
      bus.energyUsedPerDay = energyUsedPerDay
      
      // let distanceDrivenPerDay = null
      // try{
      //   const distancePerDayRes = await api.viriciti.specific(bus.vid).getDistanceDrivenPerDay()
      //   if (!distancePerDayRes.error) {
      //     distanceDrivenPerDay = distancePerDayRes.data[0].value
      //   }
      // } catch{}
      // bus.distanceDrivenPerDay = distanceDrivenPerDay


      return bus
    }))

    setAllBuses(output)
    setBuses(output)
    setLoading(false);

    // TODO: Acquire SOC Data for chart
    // const socData = await api.viriciti.specific(id).getSOC();

    // const data = socData.data.map(({value}) => value);
    // const labels = socData.data.map(({time}) => time);

    const data = null;
    const labels = null;

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
      accessorKey: 'soc',
      cell: info => info.getValue(),
      header: () => <span>SOC</span>,
    },
    {
      accessorKey: 'odo',
      cell: info => info.getValue(),
      header: () => <span>Odometer</span>,
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
      accessorKey: 'speed',
      cell: info => Math.round(info.getValue() * 100) / 100,
      header: () => <span>Speed</span>,
    },
    {
      accessorKey: 'current',
      cell: info => Math.round(info.getValue()),
      header: () => <span>Current (Amps)</span>,
    },
    {
      accessorKey: 'energyUsedPerDay',
      cell: info => Math.round(info.getValue()),
      header: () => <span>Energy used per day</span>,
    },
    // {
    //   accessorKey: 'distanceDrivenPerDay',
    //   cell: info => Math.round(info.getValue()),
    //   header: () => <span>Distance driven per day</span>,
    // },
    {
      accessorKey: 'voltage',
      cell: info => Math.round(info.getValue()),
      header: () => <span>Voltage</span>,
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