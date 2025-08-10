import { useState, useEffect, useRef, FormEvent } from "react";
import NavigationBarSpacer from "@renderer/components/NavigationBarSpacer"
import { LuBookOpenText, LuFile, LuLoader, LuSaveAll, LuX } from "react-icons/lu"
import { PluginSchema } from "src/main/bgutils/pluginInformation";
import * as Dialog from "@radix-ui/react-dialog";
import { queueToast } from "@renderer/helper/QueueToast";

export default function PreferencesPluginsPage() {
  const [plugins, updatePlugins] = useState<PluginSchema[]>([])
  const currentPluginId = useRef<string>("")
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
  const updatePluginFields = (event) => {
    event.preventDefault();
    if (event.target.tagName == "TEXTAREA") {
      return;
    }
    const formData = new FormData(event.target);
    const newFields = {};
    for (const entry of formData.entries()) {
      newFields[entry[0]] = entry[1];
      console.log(entry)
    }
    
    
    console.log(newFields)
    window.electronAPI.pluginsUpdateFields(currentPluginId.current, newFields);
    const modifiedPlugin = plugins.filter((pluginEntry) => pluginEntry.id == currentPluginId.current)
    if (modifiedPlugin.length > 0) {queueToast({background: modifiedPlugin[0].displayColor, title: modifiedPlugin[0].displayName, description: "changes saved"})}
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
                  <div key={plugin.id} className="rounded-2xl flex items-center flex-row gap-x-4 p-4" style={{background: plugin.displayColor}}>
                    <h1 className="p-2 font-semibold">{plugin.displayName}</h1>
                    <div className="grow" />
                    {plugin.fields.length > 0 ? <Dialog.Root onOpenChange={(open) => {
                      if (open) {
                        window.electronAPI.pluginsRetrieveSources().then((response) => {
                          updatePlugins(response);
                        })
                        currentPluginId.current = plugin.id;
                      }
                    }}>
                      <Dialog.Trigger asChild><span className="p-4 rounded-full bg-black bg-opacity-0 hover:bg-opacity-50 transition-all"><LuBookOpenText /></span>
                      </Dialog.Trigger>
                      <Dialog.Portal>
                        <Dialog.Overlay className="plugins-dialog-overlay" />
                        <Dialog.Content className="plugins-dialog-content shadow-lg" style={{background: plugin.displayColor}}>
                          <form onSubmit={(event) => {updatePluginFields(event)}} className="flex flex-col">
                            <div className="flex flex-row items-center gap-x-2">
                              <h1 className="text-xl font-semibold">Modify Fields</h1>
                              <span className="grow"></span>
                              <button type="submit" className="p-4 rounded-full bg-black bg-opacity-0 transition-all hover:bg-opacity-50" tabIndex={-1}><LuSaveAll /></button>
                              <Dialog.Close asChild><span className="p-4 rounded-full bg-black bg-opacity-0 transition-all hover:bg-opacity-50"><LuX /></span></Dialog.Close>
                            </div>
                            
                            <div className="gap-y-2 pt-2 flex flex-col">
                              {
                                plugin.fields.map((field) => (
                                  <fieldset key={`${plugin.id}-${field.label}`} className="w-full flex gap-x-2 items-center" >
                                    <label className="min-w-32 flex-shrink-0 drop-shadow-sm">{field.label}</label>
                                    <input  name={`${field.label}`} spellCheck={false} multiple={true} className="bg-black grow rounded-xl px-2 py-2 transition-all focus:py-4 bg-white text-black" defaultValue={field.value} />
                                  </fieldset>
                                ))
                              }
                            </div>
                          </form>
                        </Dialog.Content>
                      </Dialog.Portal>
                    </Dialog.Root> : <></>}
                    <span className="p-4 rounded-full bg-black bg-opacity-0 hover:bg-opacity-50 transition-all" onClick={() => removePlugin(plugin.id)}><LuX /></span>
                  </div>
                ))
              }
              <br />
              <div className="flex flex-row">
                <div onClick={() => {window.electronAPI.pluginsAddSources();}} className="border-white bg-transparent hover:bg-neutral-900 border-2 px-4 py-3 transition-all duration-300 ease-out items-center rounded-full flex-row inline-flex opacity-50 hover:opacity-100">
                  <LuFile className="text-2xl" />
                  <h1 className="text-sm pl-2">Add Plugins</h1>
                </div>
                
              </div>
              <br />
              
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
