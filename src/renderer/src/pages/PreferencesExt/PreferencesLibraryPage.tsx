import NavigationBarSpacer from "@renderer/components/NavigationBarSpacer"

export default function PreferencesLibraryPage() {
  return (
    <div>
      <div className="min-h-screen bg-neutral-800 flex flex-col">
        <NavigationBarSpacer accentGradient={false} />
        <div className="grow bg-neutral-800 p-4 pt-0 flex flex-col justify-center">
          <h1 className="text-5xl font-bold p-2 pl-1 pt-0 ">Library</h1>
          <div className="bg-neutral-600 grow w-full items-center rounded-2xl flex flex-col ">
            <div className="w-full p-4">
              
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
