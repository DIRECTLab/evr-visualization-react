import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../api"
import Loading from "../../components/Loading"

const Fronius = () => {

  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const loadData = async() => {
    const modelsRes = await api.ems.fronius.get()
    if (!modelsRes.error) {
      setModels(modelsRes.data)
    }

    setLoading(false)
  }

  let navigate = useNavigate()
  const routeChange = (path) => {
    navigate(path)
  }


  useEffect(() => {
    setLoading(true)
    loadData()
  }, [])

  if (loading) {
    return (
      <Loading />
    )
  } else {
    return (
      <div className="prose md:container md:mx-auto mx-auto w-full h-screen">
        <h1 className="text-4xl font-bold mb-16">Fronius</h1>
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 mb-16">
          {models.map((model, idx) => (
            <div className="h-64 card rounded-box place-items-center btn border-none text-xl" onClick={() => routeChange(`/ems/fronius/${model.model}`)} key={idx}>{model.model}</div>
          ))}
        </div>
      </div>
    )
  }
}
export default Fronius