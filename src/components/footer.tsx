import {Link} from "lucide-react";
import {ThemeToggle} from "./theme-toggle";

export function Footer() {
    return <footer className="flex items-center justify-between text-muted-foreground">
        <p className="text-xs">Shorter links. Less clutter.</p>
        <div className="flex items-center gap-2">
            <a className="flex items-center gap-1 text-xs transition-colors hover:text-foreground sm:text-sm" target="_blank" rel="noreferrer" href="https://ianpea.github.io">Ian Pee <Link size={13} /></a>
            <span className="text-border">•</span>
            <div className="transition-transform duration-200 hover:rotate-12">
            <ThemeToggle></ThemeToggle>
            </div>
        </div>
    </footer>;
}

export default Footer;
