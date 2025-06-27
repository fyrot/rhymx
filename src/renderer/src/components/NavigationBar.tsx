import { useEffect, useState } from "react"
import { LuChevronLeft, LuMenu, LuMinus, LuMaximize, LuMinimize, LuX, LuHouse, LuSearch, LuCog, LuSettings } from "react-icons/lu"
import { useNavigate } from "react-router"
const NavigationBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  useEffect(() => {
    const maximized = () => {setIsMaximized(true);}
    const unmaximized = () => {setIsMaximized(false);}
    window.electronAPI.windowMaximized(maximized);
    window.electronAPI.windowUnmaximized(unmaximized);
  })
  console.log(isMaximized);
  return (
    <div className="w-full draggable-appbar p-2 h-14 z-50 fixed flex flex-row justify-center items-center">
      
      <div className="flex flex-row transition-all  duration-300 items-center bg-black-translucent rounded-full">
        <div className="w-12 flex items-center py-2 navigation-bar-icon-bg rounded-full none-draggable-appbar justify-center ">
            <LuChevronLeft className="text-xl grow none-draggable-appbar navigation-bar-icon" />
        </div>
        <div onClick={() => {setMenuOpen(!menuOpen);}} className="w-12 flex items-center py-2 navigation-bar-icon-bg rounded-full none-draggable-appbar justify-center grow ">
            <LuMenu  className={`text-xl grow none-draggable-appbar navigation-bar-icon navigation-bar-menu-icon ${menuOpen ? "navigation-bar-menu-icon-opened" : ""} `} />
        </div>
        <div className={`${menuOpen ? "w-36" : "w-0"} overflow-hidden transition-all duration-300 flex flex-row ease-out`}>
            <div className="w-12 flex items-center py-2 navigation-bar-icon-bg rounded-full none-draggable-appbar justify-center ">
                <LuHouse className="text-xl grow none-draggable-appbar navigation-bar-icon" />
            </div>
            <div className="w-12 flex items-center py-2 navigation-bar-icon-bg rounded-full none-draggable-appbar justify-center ">
                <LuSearch className="text-xl grow none-draggable-appbar navigation-bar-icon" />
            </div>
            <div className="w-12 flex items-center py-2 navigation-bar-icon-bg rounded-full none-draggable-appbar justify-center ">
                <LuSettings className="text-xl grow none-draggable-appbar navigation-bar-icon" />
            </div>
        </div>
      </div>
      <div className="grow">
        {/* This is empty to serve as a 
            spacer between the left and right content */}
      </div>
      <div className="flex flex-row items-center bg-black-translucent rounded-full">
        <div className="w-12 mr-2 flex items-center py-2 navigation-bar-icon-bg rounded-full none-draggable-appbar justify-center">
            <LuMinus className="text-xl grow none-draggable-appbar navigation-bar-icon" />
        </div>
        <div className="w-12 mr-2 flex items-center py-2 navigation-bar-icon-bg rounded-full none-draggable-appbar justify-center" onClick={() => {console.log("toggling maximization.."); window.electronAPI.toggleMaximizeWindow()}} >
            {isMaximized ? <LuMinimize className="text-xl grow  none-draggable-appbar navigation-bar-icon"  /> : <LuMaximize className="text-xl grow  none-draggable-appbar navigation-bar-icon"  />}
            
        </div>
        <div className="w-12 flex items-center py-2 navigation-bar-icon-bg rounded-full none-draggable-appbar justify-center">
            <LuX className="text-xl grow none-draggable-appbar navigation-bar-icon" onClick={() => {console.log("closing app.."); window.electronAPI.closeWindow(true);}} />
        </div>
      </div>
    </div>
  )
}
export default NavigationBar
