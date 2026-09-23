import {Moon, Sun} from "lucide-react";

import {Button} from "@/components/ui/button";
import {useTheme} from "@/components/theme-provider";

export function ThemeToggle() {
    const {theme, setTheme} = useTheme();

    const isDark = theme === "dark";

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
        >
            {isDark ? <Sun /> : <Moon />}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}