import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'
import Loading from '../Loading'

const LocationTable = () => {
  const columns = [
    {
      accessorKey: 'siteId',
      cell: info => info.getValue(),
      header: () => <span>Site ID</span>
    },
    {
      accessorKey: 'name',
      cell: info => info.getValue(),
      header: () => <span>Site Name</span>
    },
    {
      id: 'number of chargers',
      accessorFn: row => {
        return row.Chargers.length
      },
      header: () => <span>Number of Chargers</span>
    }
  ];

  const loadData = async () => {
    const res = await api.charger.location();
    if(res.error) {
      return;
    }

    const locationData = res.data;
    setLocations(locationData);
    setLoading(false);
  }

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const table = useReactTable({
    data: locations,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  let navigate = useNavigate();
  const routeChange = (path) => {
    navigate(path);
  }

  if (loading) {
    return (
      <Loading />
    )
  } else {
    return(
      <div>
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
                  onClick={() => routeChange(`/chargers/location/${row.original.id}`)}
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

export default LocationTable;
