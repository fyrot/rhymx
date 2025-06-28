import NavigationBarSpacer from "@renderer/components/NavigationBarSpacer";

export default function SearchPage() {
  return (
    <div>
      <div className="min-h-screen flex flex-col bg-gray-500">
        <NavigationBarSpacer accentGradient={true} />
        <div className="grow flex flex-col items-center justify-center">
          <h1 className="font-extralight">this is where the "search" page will be</h1>
        </div>
      </div>
    </div>
  )
}