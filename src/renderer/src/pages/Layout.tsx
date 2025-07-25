import AudioBar from "@renderer/components/AudioBar";
import { Outlet } from "react-router";
import { Toaster } from "sonner";

export default function Layout() {
  return (
    <div className="flex flex-col overflow-hidden h-screen">
      <div className="flex-grow flex-shrink overflow-y-auto scroll-smooth">
        <Outlet />
      </div>
      <Toaster visibleToasts={3} offset={{top: "4rem", right: "0.5rem"}} position="bottom-left"/>
      <div className="bg-neutral-700">
        <AudioBar />
      </div>
      
    </div>
  )
}