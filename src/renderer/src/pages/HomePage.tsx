import NavigationBarSpacer from "@renderer/components/NavigationBarSpacer";
import PlaylistCarousel from "@renderer/components/PlaylistCarousel";
import { LuSettings } from "react-icons/lu";
import { useNavigate } from "react-router";

export default function HomePage() {
  const navigation = useNavigate();
  const navigateToPreferences = () => {
    navigation("/preferences");
  }
  return (
    <div>
      <div className="min-h-screen bg-gray-500">
        <NavigationBarSpacer accentGradient={true} />
        <h1 className="text-4xl font-semibold ml-4">...</h1>
        <div className="px-4">
          <PlaylistCarousel />
        </div>
        <br />
        <div onClick={navigateToPreferences} className="opacity-50 hover:opacity-100 rounded-full inline-flex bg-black transition-all duration-300 ease-out gap-2 ml-2 flex-row border-2 p-2 items-center justify-center">
          <LuSettings className="text-xl" />
          <h1>Manage Preferences</h1>
        </div>
      </div>
    </div>
  )
}
