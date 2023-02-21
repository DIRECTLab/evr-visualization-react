import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState, useEffect} from 'react'
import moment from 'moment'
import api from '../../api'
import Loading from '../Loading'
import { useNavigate } from 'react-router-dom'


const BusTable = () => {
  const columns = [
    {
      accessorKey: 'BusId',
      cell: info => info.getValue(),
      header: () => <span>ID</span>,
    },
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

  const [buses, setBuses] = useState([])
  const [allBuses, setAllBuses] = useState([])
  const [searchFilter, setSearchFilter] = useState('')
  const [loading, setLoading] = useState(true)
  
  const loadData = async () => {
    const busesRes = await api.newflyer.getAll();
    if (busesRes.error){
      setLoading(false)
      return alert(busesRes.error)
    }

    const busWithRoutes = await Promise.all(busesRes.data.map(async (bus) => {
      const routes = await api.newflyer.specific(bus.id).getRoute();
      if (routes.error){
        console.log(routes.error)
      }
      return { ...routes.data.lastRoute, ...bus };
    }));

    setBuses(busWithRoutes)
    setAllBuses(busWithRoutes)
    setLoading(false);
  }

  useEffect(() => {
    loadData()
  }, [])
  
  const updateFilter = () => {
    if (searchFilter === ''){
      return setBuses(allBuses)
    }

    const filtered = allBuses.filter(value => {
      for (let key of Object.keys(value)){
        if (key === 'gpsFixTime' && moment(`${value[key]}`).format('lll').includes(searchFilter())){
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

  let navigate = useNavigate()
  const routeChange = (path) => {
    navigate(path)
  }


  if (loading) {
    return (
      <Loading />
    )
  }
  else {
    return (
      <div className="w-full">
        <div className="form-control w-full max-w-xs mb-8">
          <label className="label">
            <span className="label-text text-lg">Search for charger or status</span>
          </label>
          <input type="text" placeholder="Search" onInput={(e) => {setSearchFilter(e.target.value); updateFilter()}} className="input input-bordered w-full max-w-xs" />
        </div>
        <div className="overflow-x-auto w-full">
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
                  onClick={() => routeChange(`/buses/bus/${row.original.BusId}`)}
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
      
      
    )
  }
}

export default BusTable