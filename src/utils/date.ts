import {format} from "date-fns";

/**
 * Compact, fixed-width expiry stamp: `dd/MM/yyyy HH:mm` (24-hour, local time).
 *
 * Used instead of `toLocaleString()` because locale output is long and variable
 * (e.g. `26/09/2026, 11:59:00 pm`), which overflows narrow layouts such as the
 * history sheet on phones.
 */
export function formatExpiry(value: string | Date | null | undefined): string {
    if(!value) return "";

    const date = value instanceof Date ? value : new Date(value);
    if(Number.isNaN(date.getTime())) return "";

    return format(date, "dd/MM/yyyy HH:mm");
}
