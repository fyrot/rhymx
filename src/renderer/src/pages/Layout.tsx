import AudioBar from "@renderer/components/AudioBar";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="flex flex-col overflow-hidden h-screen">
      <div className="flex-grow flex-shrink overflow-y-auto scroll-smooth">
        <Outlet />
      </div>
      <div className="bg-neutral-700">
        <AudioBar />
      </div>
      
    </div>
  )
}