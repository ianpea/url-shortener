export function Header() {
    return <header className=" flex min-h-10 items-center justify-center text-center">
        <div className="flex items-center gap-3">
            <a href="/" aria-label="URL Shortener home">
                <span>
                    <h1 className="block text-xl font-semibold tracking-tight sm:text-2xl">URL Shortener</h1>
                    <span className="hidden text-xs text-muted-foreground sm:block">Simple links, made shareable</span>
                </span>
            </a>
        </div>
    </header>;
}

export default Header;
