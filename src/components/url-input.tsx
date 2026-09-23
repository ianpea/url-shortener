import {Info} from "lucide-react";
import {Input} from "./ui/input";
import {Label} from "./ui/label";
import {Tooltip, TooltipContent, TooltipTrigger} from "./ui/tooltip";

interface UrlInputProps {
    value: string;
    placeholder?: string;
    onChange: (newValue: string) => void;
}

export function UrlInput({value, placeholder, onChange}: UrlInputProps) {
    return (
        <div className="flex flex-1 flex-col gap-2 w-full">
            <Label className="flex flex-row flex-1 mb-4" htmlFor="url">
                <div className="text-sm sm:text-lg">
                    Enter your destination link
                </div>
                <div className="flex justify-center items-center content-center">
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

            <div className="flex flex-row w-full">
                <div className="w-full">
                    <Input
                        className="md:text-sm text-xs"
                        id="url"
                        type="text"
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