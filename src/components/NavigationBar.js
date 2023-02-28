import React from "react";
import {
  Link
} from "react-router-dom";
import ThemeSelector from "./ThemeSelector";
const NavigationBar = () => {
  return (
    <>
      <div className="navbar bg-base-100 mb-2 w-full">
        <nav className="w-full">
          <div className="flex-1">
            <Link to="/" className="btn btn-ghost normal-case text-xl">ASPIRE</Link>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal p-0">
                <li><Link to="/chargers">Chargers</Link></li>
                <li><Link to="/buses">Buses</Link></li>
                <li><Link to="/ems">EMS</Link></li>
                <li><Link to="map">Map</Link></li>
                <li><div><ThemeSelector /></div></li>
            </ul>
          </div>
        </nav>
      </div>
    </>
  )
}

export default NavigationBar;