import { useEffect } from "react"

const ThemeSelector = () => {

  useEffect(() => {
    let theme = localStorage.getItem('theme')
    if (!theme) {
      localStorage.setItem('theme', 'garden')
      theme = 'garden'
    }
    const htmltag = document.querySelector('html')
    htmltag.setAttribute('data-theme', theme)
  }, [])

  const toggleTheme = (theme) => {
    let newTheme = theme
    localStorage.setItem('theme', newTheme)
    const htmltag = document.querySelector('html')
    htmltag.setAttribute('data-theme', newTheme)
  }

  return (
    <div className="dropdown dropdown-end dropdown-bottom">
      <label tabIndex={0}>Theme</label>
      <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-4">
        <li><a className="w-full" onClick={() => toggleTheme('garden')}>Garden</a></li> 
        <li><a className="w-full" onClick={() => toggleTheme('forest')}>Forest</a></li>
        <li><a className="w-full" onClick={() => toggleTheme('business')}>Business</a></li>
        <li><a className="w-full" onClick={() => toggleTheme('night')}>Night</a></li>
        <li><a className="w-full" onClick={() => toggleTheme('luxury')}>Luxury</a></li>
      </ul>
    </div>

  )
}
export default ThemeSelector