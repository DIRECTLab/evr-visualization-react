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

const TransactionTable = ({id}) => {
  const columns = [
    {
      accessorKey: 'id',
      cell: info => info.getValue(),
      header: () => <span>ID</span>,
    },
    {
      accessorKey: 'meterStart',
      cell: info => info.getValue(),
      header: () => <span>Meter Start</span>,
    },
    {
      accessorKey: 'meterStop',
      cell: info => info.getValue(),
      header: () => <span>Meter Stop</span>,
    },
    {
      accessorKey: 'powerConsumed',
      cell: info => info.getValue(),
      header: () => <span>Power Consumed</span>,
    },
    {
      accessorKey: 'connectorId',
      cell: info => info.getValue(),
      header: () => <span>Connector ID</span>,
    },
    {
      accessorFn: row => moment(row.timestampStart).format('lll'),
      cell: info => info.getValue(),
      header: () => <span>Start Time</span>,
      id: 'timestampStart',
    },
    {
      accessorFn: row => moment(row.timestampEnd).format('lll'),
      cell: info => info.getValue(),
      header: () => <span>End Time</span>,
      id: 'timestampEnd',
    },
  ]
  

  const [transactions, setTransactions] = useState([])
  const [allTransactions, setAllTransactions] = useState([])
  const [searchFilter, setSearchFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const updateFilter = () => {
    if (searchFilter === ''){
      return setTransactions(allTransactions)
    }

    const filtered = allTransactions.filter(value => {
      for (let key of Object.keys(value)){
        if ((key === 'timestampStart' || key === 'timestampEnd') && moment(`${value[key]}`).format('lll').includes(searchFilter)){
          return true
        }
        if (`${value[key]}`.toLowerCase().includes(searchFilter.toLowerCase())){
          return true
        }
      }
      return false
    })
    setTransactions(filtered)
  }



  const loadData = async () => {
    const chargerTransactionsRes = await api.charger(id).getTransactions();

    if (chargerTransactionsRes.error){
      return alert(chargerTransactionsRes.error)
    }
    setAllTransactions(chargerTransactionsRes.data);
    setTransactions(chargerTransactionsRes.data);
    setLoading(false);
  }

  useEffect(() => {
    loadData()
  }, [])
  

  const table = useReactTable({
    data: transactions,
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
            <span className="label-text text-lg">Search for charger or status</span>
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

export default TransactionTable