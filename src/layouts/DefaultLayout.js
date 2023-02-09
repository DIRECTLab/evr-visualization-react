const DefaultLayout = () => {
  return (
    <>
      <div className="navbar bg-base-100 mb-2">
        <div className="flex-1">
          <a href="/" className="btn btn-ghost normal-case text-xl">ASPIRE</a>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal p-0">
            <li><a href="/chargers">Chargers</a></li>
            <li><a href="/buses">Buses</a></li>
            <li><a href="/ems">EMS</a></li>
            <li><a href="map">Map</a></li>
          </ul>
        </div>
      </div>
      <slot />
    </>
  )
}

export default DefaultLayout;