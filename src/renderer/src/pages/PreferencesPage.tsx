import NavigationBarSpacer from "@renderer/components/NavigationBarSpacer"
import { useNavigate } from "react-router"
import { LuChevronRight, LuTvMinimal } from "react-icons/lu"
export default function PreferencesPage() {
  type PreferenceLink = {
    href: string
    text: string
    icon: any
  }
  const navigation = useNavigate()
  const preferenceLinks: PreferenceLink[] = [
    { href: "/preferences/display", text: "Display", icon: <LuTvMinimal /> }
  ]
  const navigateToPreference = (link: string) => {
    navigation(link)
  }
  return (
    <div>
      <div className="min-h-screen bg-gray-500 flex flex-col">
        <NavigationBarSpacer accentGradient={false} />
        <h1 className="text-4xl font-semibold">Preferences?</h1>
        <p>Not settings? Oookay.</p>

        <div className="grow bg-black p-4">
          <>
            {preferenceLinks.map((link) => (
              <div className="w-full bg-red-500 p-4 flex rounded-full items-center gap-4 flex-row" onClick={() => {navigateToPreference(link.href)}}>
                {link.icon}
                <h1 className="text-xl">{link.text}</h1>
                <div className="grow" />
                <LuChevronRight />
              </div>
            ))}
          </>
        </div>
      </div>
    </div>
  )
}
