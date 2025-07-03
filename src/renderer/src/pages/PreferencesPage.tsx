import NavigationBarSpacer from "@renderer/components/NavigationBarSpacer"
import { useNavigate } from "react-router"
import { LuChevronRight, LuHammer, LuLibraryBig, LuTvMinimal } from "react-icons/lu"
export default function PreferencesPage() {
  type PreferenceLink = {
    href: string
    text: string
    icon: any
  }
  const navigation = useNavigate()
  const preferenceLinks: PreferenceLink[] = [
    { href: "/preferences/display", text: "Display", icon: <LuTvMinimal /> },
    { href: "/preferences/library", text: "Library", icon: <LuLibraryBig />},
    { href: "/preferences/plugins", text: "Plugins", icon: <LuHammer />}
  ]
  const navigateToPreference = (link: string) => {
    navigation(link);
    // could do a view transition here, because of the repeated link -> title element
  }
  return (
    <div>
      <div className="min-h-screen bg-gray-500 flex flex-col">
        <NavigationBarSpacer accentGradient={false} />
        <div className="p-4 pt-0">
          <h1 className="text-4xl font-semibold">Preferences</h1>
          <p>This isn't called settings? Oookay.</p>
        
          <>
            {preferenceLinks.map((link) => (
              <div
                className="w-full bg-neutral-800 p-4 flex rounded-2xl mb-2 items-center flex-row"
                onClick={() => {
                  navigateToPreference(link.href)
                }}
              >
                <div className="flex-row w-full flex items-center justify-center gap-4">
                  <span className="text-xl">{link.icon}</span>
                  <h1 className="text-xl">{link.text}</h1>
                  <div className="grow" />
                  <span className="text-xl"><LuChevronRight /></span>
                </div>
                
              </div>
            ))}
          </>
        </div>
      </div>
    </div>
  )
}
