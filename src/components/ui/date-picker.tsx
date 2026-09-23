"use client";

import * as React from "react";
import {format} from "date-fns";
import {Calendar as CalendarIcon} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
    value?: Date;
    onChange: (date: Date | undefined) => void;
    placeholder: string;
}

export function DatePicker({value, onChange, placeholder}: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger
                render={
                    <Button
                        variant="outline"
                        data-empty={!value}
                        className="text-xs sm:text-sm w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                    />
                }
            >
                <CalendarIcon />
                {value ? format(value, "PPP") : <span>{placeholder}</span>}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar required={false} mode="single" selected={value} onSelect={onChange}
                    disabled={{before: new Date()}} />
            </PopoverContent>
        </Popover>
    );
}