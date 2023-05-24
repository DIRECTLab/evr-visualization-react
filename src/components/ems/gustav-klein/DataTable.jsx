import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState, useEffect } from 'react'
import moment from 'moment'
import api from '../../../api'
import Loading from '../../Loading'

const DataTable = () => {

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

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
  const [loading, setLoading] = useState(true)



  const loadData = async () => {
    const res = await api.ems.gustav.get({ params: { page: pageIndex, pageSize: pageSize } });
    if (res.error) {
      return alert(res.error)
    }

    const data = await Promise.all(res.data);

    setData(data);
    setLoading(false);
  }

  useEffect(() => {
    loadData()
  }, [pageIndex, pageSize])


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
        <div className="overflow-x-auto w-full h-96">
          <table className="table table-zebra w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup, header_group_id) => (
                <tr className="sticky top-0" key={header_group_id}>
                  {headerGroup.headers.map((header, header_id) => (
                    <th key={`header-${header_id}-header-group-${header_group_id}`}>
                      {header.isPlaceholder ? null : <div className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''} >{flexRender(header.column.columnDef.header, header.getContext())}</div>}
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
        </div >
        <div className="h-2" />
        <div className="btn-group border-primary">
          <button
            className="btn"
            disabled={pageIndex === 0}
            onClick={() => setPageIndex(0)}
          >«</button>
          <button
            className="btn"
            disabled={pageIndex === 0}
            onClick={() => setPageIndex(old => old - 1)}
          >‹</button>
          <button className="btn">Page {pageIndex}</button>
          <button onClick={() => setPageIndex(old => old + 1)} className="btn">›</button>
        </div>
        <select
          className="select select-primary w-full max-w-xs ml-4"
          defaultValue={{ label: 'Items per page', value: pageSize }}
          onChange={(e) => { setPageSize(e.target.value); }}
        >
          <option disabled>Items per Page</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    )
  }
}

export default DataTable