//import electronLogo from './assets/electron.svg'
import { MemoryRouter, Routes, Route } from "react-router"
import NavigationBar from "./components/NavigationBar"
import HomePage from "./pages/HomePage"
import PreferencesPage from "./pages/PreferencesPage"
import PreferencesDisplayPage from "./pages/PreferencesExt/PreferencesDisplayPage"
import SearchPage from "./pages/SearchPage"
import PreferencesLibraryPage from "./pages/PreferencesExt/PreferencesLibraryPage"
import { useEffect } from "react"
function App() {
  useEffect(() => {
    const accentColor = localStorage.getItem("--accent-color");
    if (accentColor !== null) {
      document.documentElement.style.setProperty("--accent-color", accentColor);
      console.log("it isn't null!");
    }
    
    
  })
  return (
    <>
      <MemoryRouter>
        <NavigationBar />
        <div>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} /> 
            <Route path="/preferences" element={<PreferencesPage />} />
            <Route path="/preferences/display" element={<PreferencesDisplayPage />} />
            <Route path="/preferences/library" element={<PreferencesLibraryPage />} />
          </Routes>
        </div>
        </MemoryRouter>
    </>
  )
}

export default App
