import {useTheme} from "./theme-provider";
import {ArrowUpRight} from "lucide-react";

export function Header() {
    const {theme} = useTheme();
    const logoType = theme == 'dark' ? 'white' : 'black';
    return <header className="group/header flex items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-3" aria-label="URL Shortener home">
            <span className="-mr-3 flex h-10 w-0 items-center justify-center overflow-hidden rounded-xl border border-transparent bg-card/80 opacity-0 shadow-sm backdrop-blur transition-all duration-200 group-hover/header:mr-0 group-hover/header:w-10 group-hover/header:border-border/70 group-hover/header:opacity-100 group-focus-within/header:mr-0 group-focus-within/header:w-10 group-focus-within/header:border-border/70 group-focus-within/header:opacity-100">
                <img src={`/vs-logo-${logoType}.svg`} alt="" className="w-7 shrink-0" />
            </span>
            <span>
                <span className="block text-sm font-semibold tracking-tight sm:text-base">URL Shortener</span>
                <span className="hidden text-xs text-muted-foreground sm:block">Simple links, made shareable</span>
            </span>
        </a>
        <a className="group flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm" href="https://www.visitsingapore.com/" target="_blank" rel="noreferrer">
            Visit Singapore
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
    </header>;
}

export default Header;
