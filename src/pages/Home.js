import React from "react"
import DefaultLayout from "../layouts/DefaultLayout"


const Home = () => {

  return (
    <div className="prose md:container md:mx-auto mx-auto mb-8">
      <div className="card shadow-xl mx-4 my-8">
        <div className="card-body">
          {/* <LevitonAndSum /> */}
          <h1 className="text-xl">TEST</h1>
        </div>
      </div>
      <div className="my-4">
        {/* <CurrentUtilization /> */}
      </div>
      <div className="my-4">
        {/* <GraphCarousel /> */}
      </div>
      <div className="my-4">
        {/* <UsuChargers /> */}
      </div>
    </div>
  )
}

export default Home;