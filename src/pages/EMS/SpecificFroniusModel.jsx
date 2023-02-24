import { useParams } from "react-router-dom"
import DataTable from "../../components/ems/fronius/DataTable"

const SpecificFroniusModel = () => {
  const {id} = useParams()
  return (
    <div className="prose md:container md:mx-auto mx-auto mb-8">
      <DataTable id={id} />
    </div>
  )
}

export default SpecificFroniusModel