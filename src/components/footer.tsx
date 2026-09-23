import {Link} from "lucide-react";
import {ThemeToggle} from "./theme-toggle";

export function Header() {
    return <footer className="flex flex-row items-center gap-2 text-center">
        <div className="flex flex-row">&nbsp;<a className="flex flex-row items-center" target="window" href="https://ianpea.github.io"><p className="underline text-xs sm:text-sm">Ian Pee</p>&nbsp;<Link size={14} /></a>  </div>
        <div>•</div>
        <ThemeToggle></ThemeToggle>
    </footer>;
}

export default Header;