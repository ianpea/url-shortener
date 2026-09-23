import {useTheme} from "./theme-provider";

export function Header() {
    const {theme} = useTheme();
    const logoType = theme == 'dark' ? 'white' : 'black';
    return <header className="group flex flex-col items-center gap-2 text-center">

        <div className="h-0 opacity-0 group-hover:h-15 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
            <a href="https://www.visitsingapore.com/">
                <img src={`/vs-logo-${logoType}.svg`} alt="Visit Singapore" className="darkLogo" />
            </a>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold">
            URL Shortener
        </h1>
        <p className="text-muted-foreground text-xs sm:text-base">
            Turn long URLs into short, shareable links.
        </p>
    </header>;
}

export default Header;