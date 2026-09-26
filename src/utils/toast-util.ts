import {toast} from "@/components/ui/toast";

export function showToast(title: string, description: string, type: "default" | "success" | "info" | "warning" | "error") {
    toast.add({
        title,
        description: description,
        timeout: 2500,
        type
    });
}