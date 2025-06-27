//import electronLogo from './assets/electron.svg'
import { MemoryRouter, Routes, Route } from "react-router"
import NavigationBar from "./components/NavigationBar"
import HomePage from "./pages/HomePage"
import PreferencesPage from "./pages/PreferencesPage"
function App() {
  return (
    <>
      <MemoryRouter>
        <NavigationBar />
        <div>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/preferences" element={<PreferencesPage />} />
          </Routes>
        </div>
        </MemoryRouter>
    </>
  )
}

export default App
