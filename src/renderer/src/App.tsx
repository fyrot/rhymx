//import electronLogo from './assets/electron.svg'
import { MemoryRouter, Routes, Route } from "react-router"
import NavigationBar from "./components/NavigationBar"
import HomePage from "./pages/HomePage"
import PreferencesPage from "./pages/PreferencesPage"
import PreferencesDisplayPage from "./pages/PreferencesExt/PreferencesDisplayPage"
import SearchPage from "./pages/SearchPage"
import PreferencesLibraryPage from "./pages/PreferencesExt/PreferencesLibraryPage"
import { useEffect } from "react"
import LibraryPage from "./pages/LibraryPage"
import AlbumPage from "./pages/AlbumPage"
import PreferencesPluginsPage from "./pages/PreferencesExt/PreferencesPluginsPage"
import Layout from "./pages/Layout"
import ArtistPage from "./pages/ArtistPage"
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
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} /> 
              <Route path="/preferences" element={<PreferencesPage />} />
              <Route path="/preferences/display" element={<PreferencesDisplayPage />} />
              <Route path="/preferences/library" element={<PreferencesLibraryPage />} />
              <Route path="/preferences/plugins" element={<PreferencesPluginsPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/album" element={<AlbumPage />} />
              <Route path="/artist" element={<ArtistPage />} />
            </Route>
          </Routes>  
        </div>
        </MemoryRouter>
    </>
  )
}

export default App
