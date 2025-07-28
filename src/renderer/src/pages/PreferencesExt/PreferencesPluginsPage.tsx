import { useState, useEffect } from "react";
import NavigationBarSpacer from "@renderer/components/NavigationBarSpacer"
import { LuFile, LuLoader, LuX } from "react-icons/lu"
import { PluginDisplay } from "src/main/bgutils/pluginInformation";


export default function PreferencesPluginsPage() {
  const [plugins, updatePlugins] = useState<PluginDisplay[]>([])
  useEffect(() => {
    window.electronAPI.pluginsRetrieveSources().then((response) => {
      updatePlugins(response);
      console.log(response)
    })
    window.electronAPI.pluginsNotifyUpdate(() => {
      window.electronAPI.pluginsRetrieveSources().then((response) => {
        updatePlugins(response);
        console.log(response)
      })
    })
  }, [])
  const removePlugin = (id) => {
    window.electronAPI.pluginsDeleteSource(id);
  }
  return (
    <div>
      <div className="min-h-screen bg-neutral-800 flex flex-col">
        <NavigationBarSpacer accentGradient={false} />
        <div className="grow bg-neutral-800 p-4 pt-0 flex flex-col justify-center">
          <h1 className="text-5xl font-bold p-2 pl-1 pt-0 ">Plugins</h1>
          <div className="bg-neutral-600 grow w-full items-center rounded-2xl flex flex-col ">
            <div className="w-full flex flex-col p-4">
              {
                plugins.map(plugin => (
                  <div key={plugin.id} className="rounded-full flex items-center flex-row p-4" style={{background: plugin.displayColor}}>
                    <h1 className="p-2 font-semibold">{plugin.displayName}</h1>
                    <div className="grow" />
                    <span className="p-2 rounded-full bg-black bg-opacity-0 hover:bg-opacity-50 transition-all" onClick={() => removePlugin(plugin.id)}><LuX /></span>
                  </div>
                ))
              }
              <br />
              <div className="flex flex-row">
                <div onClick={() => {window.electronAPI.pluginsAddSources();}} className="inline-flex bg-black opacity-50 hover:opacity-100 flex-row gap-x-2 border-2 rounded-full p-3 items-center">
                  <LuFile className="text-xl" />
                  <h1 className="inline-block">Add Plugins</h1>
                </div>
              </div>
              <br />
              <div className="flex flex-row">
                <div className="inline-flex bg-black opacity-50 hover:opacity-100 flex-row gap-x-2 rounded-full p-3">
                  <LuLoader className="text-xl" />
                  <h1>Load Plugins</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
