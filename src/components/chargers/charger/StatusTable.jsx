import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState, useEffect} from 'react'
import moment from 'moment'
import api from '../../../api'
import Loading from '../../Loading'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faXmarkCircle } from '@fortawesome/free-regular-svg-icons'

const StatusTable = ({id}) => {
  const columns = [
    {
      accessorKey: 'status',
      cell: info => info.getValue(),
      header: () => <span>Status</span>,
    },
    {
      accessorKey: 'connected',
      cell: info => info.getValue() ? <FontAwesomeIcon icon={faCircleCheck} className="text-success"/> :<FontAwesomeIcon icon={faXmarkCircle} className="text-error"/>,
      header: () => <span>Connected</span>,
    },
    {
      accessorFn: row => moment(row.statusTime).format('lll'),
      cell: info => info.getValue(),
      header: () => <span>Last Status Time</span>,
      id: 'statusTime',
    },
  ]

  const [statuses, setStatuses] = useState([])
  const [allStatuses, setAllStatuses] = useState([])
  const [searchFilter, setSearchFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const updateFilter = () => {
    if (searchFilter === ''){
      return setStatuses(allStatuses)
    }

    const filtered = allStatuses.filter(value => {
      for (let key of Object.keys(value)){
        if (key === 'statusTime' && moment(`${value[key]}`).format('lll').includes(searchFilter)){
          return true
        }
        if (`${value[key]}`.toLowerCase().includes(searchFilter.toLowerCase())){
          return true
        }
      }
      return false
    })
    setStatuses(filtered)
  }


  const loadData = async () => {
    const chargerStatus = await api.charger(id).getAllStatus();

    if (chargerStatus.error){
      return alert(chargerStatus.error)
    }
    setAllStatuses(chargerStatus.data);
    setStatuses(chargerStatus.data);
    setLoading(false);
  }

  useEffect(() => {
    loadData()
  }, [])
  

  const table = useReactTable({
    data: statuses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })


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
            <span className="label-text text-lg">Search for status or time</span>
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
      
    )
  }
}

export default StatusTable