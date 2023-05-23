import DataTable from "../../components/ems/yaskawa/DataTable"

const Yaskawa = () => {
  return (
    <div className="prose md:container md:mx-auto mx-auto w-full">
      <h1 className="mb-16 text-4xl font-bold">Yaskawa</h1>
      <DataTable />
      <div className="my-8"/>
    </div>   
  )
}

export default Yaskawa