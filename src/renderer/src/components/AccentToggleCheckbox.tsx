const AccentToggleCheckbox = ({toggled}) => {
  return (
    <div className={`rounded-full min-w-14 min-h-8 bg-neutral-800 flex items-center`}>
      <div className={`${toggled ? "w-6" : "w-0"} transition-all duration-150 `} />
      <div className={`rounded-full w-6 h-6 m-1 transition-colors duration-300 ${toggled ? "accent-color-checkbox-background" : "bg-neutral-400"}`} />
    </div>
  )
}
export default AccentToggleCheckbox;