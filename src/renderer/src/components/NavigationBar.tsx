import { useEffect, useState } from "react"
import { LuChevronLeft, LuMenu, LuMinus, LuMaximize, LuMinimize, LuX, LuHouse, LuSearch, LuCog, LuSettings, LuLibrary } from "react-icons/lu"
import { useLocation, useNavigate } from "react-router"
const NavigationBar = () => {
  type MainNavigation = {
    name: string,
    icon: any,
    href: string
  }
  
  const [menuOpen, setMenuOpen] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  
  const mainNavigationLinks:MainNavigation[] = [
    {name: "Home", icon: <LuHouse  />, href: "/"},
    {name: "Library", icon: <LuLibrary />, href: "/library"},
    {name: "Search", icon: <LuSearch />, href: "/search"},

    //{name: "Preferences", icon: <LuSettings  />, href: "/preferences"},
    
  ]

  const navigation = useNavigate();
  const navigationPosition = useLocation();
  const navigationHistoryExists = !(navigationPosition.key == "default"  || (navigationPosition.pathname == "/" || navigationPosition.pathname == "/search" || navigationPosition.pathname == "/library"));
  //|| navigationPosition.pathname == "/preferences"
  useEffect(() => {
    const maximized = () => {setIsMaximized(true);}
    const unmaximized = () => {setIsMaximized(false);}
    window.electronAPI.windowMaximized(maximized);
    window.electronAPI.windowUnmaximized(unmaximized);
  }, [])

  const navigateToPage = (link: string) => {
    navigation(link);
  }
  const navigateBack = () => {
    navigation(-1);
  }
  //console.log(navigationPosition.pathname);
  //console.log(navigationHistoryExists);
  return (
    <div className="w-full draggable-appbar p-2 h-14 z-50 fixed flex flex-row justify-center items-center">
      
      <div className="flex flex-row transition-all  duration-300 items-center bg-black-translucent rounded-full">
        <div className={`${navigationHistoryExists ? "w-12" : "w-0"} overflow-hidden transition-all duration-300 ease-out flex flex-row`}>
          <div className="w-12 flex items-center py-2 navigation-bar-icon-bg rounded-full none-draggable-appbar justify-center " onClick={navigateBack}>
            <LuChevronLeft className="text-xl grow none-draggable-appbar navigation-bar-icon" />
          </div>
        </div>
        
        <div onClick={() => {setMenuOpen(!menuOpen);}} className="w-12 flex items-center py-2 navigation-bar-icon-bg rounded-full none-draggable-appbar justify-center grow ">
            <LuMenu  className={`text-xl grow none-draggable-appbar navigation-bar-icon navigation-bar-menu-icon ${menuOpen ? "navigation-bar-menu-icon-opened" : ""} `} />
        </div>
        <div className={`${menuOpen ? "w-36" : "w-0"} overflow-hidden transition-all duration-300 flex flex-row ease-out`}>
            
            <>
            {mainNavigationLinks.map((link) => (
              
              <div onClick={() => {navigateToPage(link.href)}} className="w-12 items-center py-2 navigation-bar-icon-bg rounded-full none-draggable-appbar justify-center flex">
                <span className={`text-xl grow none-draggable-appbar flex items-center justify-center ${navigationPosition.pathname == link.href ? "text-white" : "navigation-bar-icon"}`}>{link.icon}</span>
              </div>
              
            ))}
            </>
        </div>
      </div>
      <div className="grow">
        {/* This is empty to serve as a 
            spacer between the left and right content */}
      </div>
      <div className="flex flex-row items-center bg-black-translucent rounded-full">
        <div className="w-12 mr-2 flex items-center py-2 navigation-bar-icon-bg rounded-full none-draggable-appbar justify-center" onClick={() => {console.log("minimizing application.."); window.electronAPI.minimizeWindow();}}>
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
