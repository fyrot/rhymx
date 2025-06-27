import NavigationBarSpacer from "@renderer/components/NavigationBarSpacer";

export default function PreferencesDisplayPage() {
    return (
        <div>
            <div className="min-h-screen bg-gray-500 flex flex-col">
                <NavigationBarSpacer accentGradient={false} />
                <div className="grow bg-gray-500 p-4 pt-1 flex flex-col justify-center items-center">
                    <div className="bg-gray-800 grow w-full  rounded-2xl flex items-center justify-center">
                        <h1>Who needs a boat when you can ride the waves like this? 🌊</h1>
                    </div>
                </div>
            </div>
        </div>
    )
}