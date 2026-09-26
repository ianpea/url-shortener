import {useUrls} from "@/hooks/use-urls";
import {RotateCcwClock, ClockFading, Copy, Trash, ArrowLeft, ArrowRight, Tag} from "lucide-react";
import {useState} from "react";
import {Item, ItemContent, ItemTitle, ItemDescription, ItemActions} from "./ui/item";
import {Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription} from "./ui/sheet";
import {Spinner} from "./ui/spinner";
import {Button} from "./ui/button";
import {copyShortUrl} from "@/utils/url";
import {showToast} from "@/utils/toast-util";
import {Badge} from "./ui/badge";
import {useDeleteUrl} from "@/hooks/use-delete-url";
import {Separator} from "./ui/separator";
import {formatExpiry} from "@/utils/date";

export function HistorySheet() {
    const [historyOpen, setHistoryOpen] = useState(false);
    const [page, setPage] = useState(1);
    const historyQuery = useUrls(page);
    const deleteMutation = useDeleteUrl();
    const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

    function handleHistoryOpen(open: boolean) {
        setHistoryOpen(open);
        if(open) {
            setPage(1);
            historyQuery.refetch();
        }
    }

    async function handleCopy(shortCode: string) {
        const shortUrl = await copyShortUrl(shortCode);
        showToast("Copied!", `${shortUrl}`, "success");
    }

    function handleDelete(id: number) {
        setDeletingIds(prev => new Set(prev).add(id));
        deleteMutation.mutate(id, {
            onSuccess: async () => {
                showToast('Delete success', "", "success");
                if(historyQuery.data?.items.length == 1 && page != 1) {
                    setPage((page) => page - 1);
                }
                setDeletingIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(id);
                    return newSet;
                });
            },
            onError: async (error) => {
                showToast("Something went wrong", `${error.message}`, "error");
            }
        });
    }

    return <>
        <Sheet open={historyOpen} onOpenChange={handleHistoryOpen}>
            <SheetTrigger render={
                <Button variant="outline">
                    <RotateCcwClock /> Links
                </Button>
            }>
            </SheetTrigger>

            <SheetContent side='right' className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Your URLs</SheetTitle>
                    <SheetDescription>
                    </SheetDescription>
                </SheetHeader>
                <Separator className='mb-4'></Separator>
                <div className="min-h-0 flex-1 overflow-y-scroll px-4">
                    <div className="flex flex-1 flex-col items-center space-y-4">
                        {historyQuery.isFetching && (<Spinner className="size-7 mb-6" />)}
                        {historyQuery.error && (<p className='text-red-700'>{historyQuery.error.message}</p>)}
                        {!historyQuery.isFetching && historyQuery.data?.items.map(url => (
                            <div className="w-full" key={url.id}>
                                <Item variant="outline">
                                    <ItemContent className="min-w-0">
                                        <ItemTitle className="line-clamp-none break-all text-xs sm:text-sm text-gray-700 dark:text-gray-200 ">
                                            <span>{url.originalUrl}</span>
                                        </ItemTitle>
                                        <ItemDescription className='flex flex-col'>
                                            <div className='mt-2 items-center space-y-2'>
                                                {url.tag && <Badge variant="outline" className="mt-3 text-primary"><Tag className="size-3" />{url.tag}</Badge>}
                                                {url.expiryDate && <Badge variant='outline' className='min-w-0 shrink'><ClockFading className='size-4 shrink-0' /> <span className="text-xs text-gray-400">{formatExpiry(url.expiryDate)}</span></Badge>}
                                            </div>
                                        </ItemDescription>
                                    </ItemContent>
                                    <ItemActions className="flex-col sm:flex-row">
                                        <Button variant="outline" size="sm" onClick={() => handleCopy(url.shortCode)}>
                                            <Copy className=''></Copy>
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDelete(url.id)}>
                                            {!deletingIds.has(url.id) && <Trash className=''></Trash>}
                                            {deletingIds.has(url.id) && (<Spinner></Spinner>)}
                                        </Button>
                                    </ItemActions>
                                </Item>
                            </div>))
                        }
                        {historyQuery.data?.items.length == 0 && (<div className="text-xs text-gray-400">Nothing to see here.</div>)}
                        {historyQuery.data && historyQuery.data.total > 5 && (
                            <div className="flex items-center justify-between px-4 pb-4 space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 1}
                                    onClick={() => setPage((page) => page - 1)}
                                    className='text-xs sm:text-sm'
                                >
                                    <ArrowLeft></ArrowLeft>
                                </Button>

                                <span className="text-xs sm:text-sm text-muted-foreground">
                                    Page {page} of {historyQuery.data.totalPages}
                                </span>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= historyQuery.data.totalPages}
                                    onClick={() => setPage((page) => page + 1)}
                                    className='text-xs sm:text-sm'
                                >
                                    <ArrowRight></ArrowRight>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet >
    </>;
}
