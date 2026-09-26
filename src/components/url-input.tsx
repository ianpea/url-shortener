import {Info} from "lucide-react";
import {Input} from "./ui/input";
import {Label} from "./ui/label";
import {Tooltip, TooltipContent, TooltipTrigger} from "./ui/tooltip";

interface UrlInputProps {
    value: string;
    placeholder?: string;
    autoFocus?: boolean;
    onChange: (newValue: string) => void;
}

export function UrlInput({value, placeholder, autoFocus, onChange}: UrlInputProps) {
    return (
        <div className="flex w-full flex-1 flex-col gap-2">
            <Label className="flex flex-1 items-center gap-1.5" htmlFor="url">
                <div className="text-sm font-medium">
                    Enter your destination link
                </div>
                <div className="flex justify-center items-center content-center transition-transform duration-300 hover:scale-110">
                    <Tooltip>
                        <TooltipTrigger>
                            <Info className="size-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>Paste your url here, it could be any URL, with any params.</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </Label>

            <div className="flex w-full">
                <div className="w-full">
                    <Input
                        className="h-12 rounded-xl border-border/80 bg-background/80 px-4 text-sm shadow-inner shadow-foreground/[0.02] transition-shadow focus-visible:ring-primary/20"
                        id="url"
                        type="text"
                        autoFocus={autoFocus}
                        placeholder={placeholder ?? "Enter a URL"}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>

            </div>
        </div>
    );
}

export default UrlInput;
