import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState, useEffect} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faXmarkCircle } from '@fortawesome/free-regular-svg-icons'
import moment from 'moment'
import api from '../../../api'
import Loading from '../../Loading'

const ChargeProfileTable = ({id}) => {
  const columns = [
    {
      accessorKey: 'chargingProfileId',
      cell: info => info.getValue(),
      header: () => <span>ID</span>,
    },
    {
      accessorKey: 'chargingProfileKind',
      cell: info => info.getValue(),
      header: () => <span>Kind</span>,
    },
    {
      accessorKey: 'chargingProfilePurpose',
      cell: info => info.getValue(),
      header: () => <span>Purpose</span>,
    },
    {
      accessorKey: 'stackLevel',
      cell: info => info.getValue(),
      header: () => <span>Stack Level</span>,
    },
    {
      accessorKey: 'accepted',
      cell: info => info.getValue() ? <FontAwesomeIcon icon={faCircleCheck} className="text-success"/> :<FontAwesomeIcon icon={faXmarkCircle} className="text-error"/>,
      header: () => <span>Accepted</span>,
    },
    {
      accessorKey: 'cleared',
      cell: info => info.getValue() ? <FontAwesomeIcon icon={faCircleCheck} className="text-success"/> :<FontAwesomeIcon icon={faXmarkCircle} className="text-error"/>,
      header: () => <span>Cleared</span>,
    },
    {
      accessorFn: row => row.chargingSchedule.chargingSchedulePeriod[0].limit,
      cell: info => info.getValue(),
      header: () => <span>Curtailment Limit</span>,
      id: 'limit'
    },
    {
      accessorFn: row => moment(row.createdAt).format('lll'),
      cell: info => info.getValue(),
      header: () => <span>Created At</span>,
      id: 'createdAt',
    },
  ]
  
  const [profiles, setProfiles] = useState([])
  const [allProfiles, setAllProfiles] = useState([])
  const [searchFilter, setSearchFilter] = useState('')
  const [loading, setLoading] = useState(true)


  const updateFilter = () => {
    if (searchFilter === ''){
      return setProfiles(allProfiles)
    }

    const filtered = allProfiles.filter(value => {
      for (let key of Object.keys(value)){
        if (key === 'createdAt' && moment(`${value[key]}`).format('lll').includes(searchFilter)){
          return true
        }
        if (`${value[key]}`.toLowerCase().includes(searchFilter.toLowerCase())){
          return true
        }
      }
      return false
    })
    setProfiles(filtered)
  }



  const loadData = async () => {
    const chargerProfileRes = await api.charger(id).getAllProfiles();

    if (chargerProfileRes.error){
      return alert(chargerProfileRes.error);
    }
    setAllProfiles(chargerProfileRes.data);
    setProfiles(chargerProfileRes.data);
    setLoading(false);
  }

  useEffect(() => {
    loadData()
  }, [])
  

  const table = useReactTable({
    data: profiles,
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

export default ChargeProfileTable