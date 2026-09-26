import {useTheme} from "./theme-provider";

export function Header() {
    const {theme} = useTheme();
    const logoType = theme == 'dark' ? 'white' : 'black';
    return <header className=" flex min-h-10 items-center justify-center text-center">
        <div className="flex items-center gap-3">
            <a href="/" aria-label="URL Shortener home">
                <span>
                    <span className="block text-sm font-semibold tracking-tight sm:text-base">URL Shortener</span>
                    <span className="hidden text-xs text-muted-foreground sm:block">Simple links, made shareable</span>
                </span>
            </a>
        </div>
    </header>;
}

export default Header;
