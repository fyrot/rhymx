const NavigationBarSpacer = ({accentGradient}) => {

    return (
        <div className={`h-14 w-screen ${accentGradient == true ? "navigation-bar-spacer" : ""}`}></div>
    )
}


export default NavigationBarSpacer;