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

const DataTable = () => {
  const columns = [
    {
      accessorKey: 'id',
      cell: info => info.getValue(),
      header: () => <span>ID</span>,
    },
    {
      accessorKey: 'measuredAmp',
      cell: info => parseFloat(info.getValue().toFixed(2)),
      header: () => <span>Measured Amp</span>,
    },
    {
      accessorKey: 'measuredPower',
      cell: info => parseFloat(info.getValue().toFixed(2)),
      header: () => <span>Measured Power</span>,
    },
    {
      accessorKey: 'measuredVoltage',
      cell: info => parseFloat(info.getValue().toFixed(2)),
      header: () => <span>Measured Voltage</span>,
    },
    {
      accessorFn: row => moment(row.updatedAt).fromNow(),
      cell: info => info.getValue(),
      header: () => <span>Last Updated</span>,
      id: 'updatedAt',
    },
  ]
  
  
  const [data, setData] = useState([])
  const [allData, setAllData] = useState([])
  const [searchFilter, setSearchFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const updateFilter = () => {
    if (searchFilter === ''){
      return setData(allData)
    }

    const filtered = allData.filter(value => {
      for (let key of Object.keys(value)){
        if (`${value[key]}`.toLowerCase().includes(searchFilter.toLowerCase())){
          return true
        }
      }
      return false
    })
    setData(filtered)
  }




  const loadData = async () => {
    const res = await api.ems.gustav_klein.getAll();
    if (res.error) {
      return alert(res.error)
    }    

    const data = await Promise.all(res.data);

    setAllData(data);
    setData(data);
    setLoading(false);
  }

  useEffect(() => {
    loadData()
  }, [])
  

  const table = useReactTable({
    data: data,
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
            <span className="label-text text-lg">Search for specific data</span>
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

export default DataTable