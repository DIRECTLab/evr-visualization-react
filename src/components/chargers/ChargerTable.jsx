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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faXmarkCircle } from '@fortawesome/free-regular-svg-icons'
import { Link, Navigate, Route, useNavigate } from 'react-router-dom'

const ChargerTable = () => {
  const columns = [
    {
      accessorKey: 'chargerName',
      cell: info => info.getValue(),
      header: () => <span>Name</span>,
    },
    {
      accessorKey: 'ChargerId',
      cell: info => info.getValue(),
      header: () => <span>ID</span>,
    },
    {
      accessorKey: 'connected',
      cell: info => info.getValue() ? <FontAwesomeIcon icon={faCircleCheck} className="text-success"/> :<FontAwesomeIcon icon={faXmarkCircle} className="text-error"/>,

      header: () => <span>Connected</span>,
    },
    {
      accessorKey: 'status',
      cell: info => info.getValue(),
      header: () => <span>Status</span>,
    },
    {
      accessorFn: row => moment(row.statusTime).fromNow(),
      cell: info => info.getValue(),
      header: () => <span>Last Status</span>,
      id: 'statusTime',
    },
  ]

  const [chargers, setChargers] = useState([])
  const [allChargers, setAllChargers] = useState([])
  const [searchFilter, setSearchFilter] = useState('')
  const [loading, setLoading] = useState(true)
  
  const loadData = async () => {
    const res = await api.charger.get();
    if (res.error){
      return
    }
    
    const chargerData = await Promise.all(res.data.map(async charger => {
      const chargerRes = await api.charger.status({ params: {recent: true, id: charger.id}});
      if (chargerRes.error){
        alert(chargerRes.error)
      }
      else{
        return { ...charger, ...chargerRes.data };
      }
    }))
    setAllChargers(chargerData);
    setChargers(chargerData);
    setLoading(false);
  }

  useEffect(() => {
    loadData()
  }, [])
  
  const updateFilter = () => {
    if (searchFilter === ''){
      return setChargers(allChargers)
    }

    const filtered = allChargers.filter(value => {
      for (let key of Object.keys(value)){
        if (`${value[key]}`.toLowerCase().includes(searchFilter.toLowerCase())){
          return true
        }
      }
      return false
    })
    setChargers(filtered)
  }

  const table = useReactTable({
    data: chargers,
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
        <div className="overflow-x-auto w-full h-[35rem]">
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
                  onClick={() => routeChange(`/chargers/charger/${row.original.ChargerId}`)}
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

export default ChargerTable
