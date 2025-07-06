const NavigationBarSpacer = ({accentGradient}) => {

    return (
        <div className={`h-14 w-screen flex-shrink-0 ${accentGradient == true ? "navigation-bar-spacer" : ""}`}></div>
    )
}


export default NavigationBarSpacer;