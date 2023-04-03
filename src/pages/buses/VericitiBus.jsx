import { useParams } from "react-router-dom"
import SpecificBus from "../../components/buses/Vericiti/SpecificBus"

const VericitiBus = () => {

  const { id } = useParams()
  return (
    <div className="prose md:container md:mx-auto mx-auto mb-8">
      <h1 className="text-4xl font-bold mb-8">Bus Details for {id}</h1>
      <h2 className="text-2xl font-bold mb-8">SOC Data</h2>
      <SpecificBus id={id}/>
    </div>
  )
}

export default VericitiBus