import NavigationBarSpacer from "@renderer/components/NavigationBarSpacer"
import { useEffect, useState } from "react"

import AccentToggleCheckbox from "@renderer/components/AccentToggleCheckbox"

export default function PreferencesDisplayPage() {
  type AccentColorDisplay = {
    colorCode: string
    name: string
    displayColor: string
  }
  const accentColorsList: AccentColorDisplay[] = [
    { colorCode: "250, 250, 250", name: "Off White", displayColor: "#FAFAFA" },
    { colorCode: "255, 86, 71", name: "Rudymentary Classic", displayColor: "#FF5647"}
    
  ]
  /**
   * the colorCode property is formatted like this
   * in order to make use of css custom properties
   * so we can apply rgba() alpha values
   * original accent color in index.css:   229, 43, 80
   * { colorCode: "229, 43, 80", name: "Amaranth", displayColor: "#E52B50" },
    { colorCode: "0, 127, 255", name: "Azure", displayColor: "#007FFF" }
   */

  const [accentColor, updateAccentColor] = useState(
    getComputedStyle(document.documentElement, null).getPropertyValue("--accent-color")
  )

  
  const updateDocumentAccentColor = (colorValue: string) => {
    document.documentElement.style.setProperty("--accent-color", colorValue)
    updateAccentColor(colorValue)
    localStorage.setItem("--accent-color", colorValue)
  }

  
  return (
    <div>
      <div className="min-h-screen bg-neutral-800 flex flex-col">
        <NavigationBarSpacer accentGradient={false} />
        <div className=" bg-neutral-800 p-4 pt-0 flex flex-col justify-center">
          <h1 className="text-5xl font-bold p-2 pl-1 pt-0 ">Display</h1>
          <div className="bg-neutral-600 grow w-full items-center rounded-2xl flex flex-col ">
            <div className="w-full p-4">
              <div className="w-full p-4 rounded-2xl bg-neutral-800 flex flex-col">
                <div>
                  <h1 className="accent-color-text-hover-partial-underline font-semibold text-2xl pb-1 inline-block">
                    Accent Color
                  </h1>
                </div>

                <div className="flex flex-row flex-wrap pt-2 items-center gap-2">
                  {accentColorsList.map((color) => (
                    <div
                      onClick={() => {
                        updateDocumentAccentColor(color.colorCode)
                      }}
                      className={`w-16 h-16 p-2 rounded-full bg-black hover:bg-neutral-800 transition-all ease-out duration-500 border-spacing-8 border-4 ${color.colorCode == accentColor ? "border-white" : "border-transparent"}`}
                      title={color.name}
                    >
                      <div
                        style={{ background: color.displayColor }}
                        className="w-full h-full rounded-full"
                      />
                      </div>
                  ))}
                </div>
              </div>
            </div>
            
            <h1>{/*Who needs a boat when you can ride the waves like this? 🌊*/}</h1>
          </div>
        </div>
      </div>
    </div>
  )
}
