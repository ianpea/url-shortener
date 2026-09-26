
import {useState} from 'react';
import {Spinner} from '../components/ui/spinner';
import {Button} from '../components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../components/ui/card';
import UrlInput from '../components/url-input';
import {ToggleGroup, ToggleGroupItem} from '../components/ui/toggle-group';
import {StbAlertDialog} from '../components/stb-alert-dialog';
import {ClockFading, Link2, LockKeyholeOpen, Tag, Zap} from 'lucide-react';
import {Tooltip, TooltipContent, TooltipTrigger} from '../components/ui/tooltip';
import type {ShortenUrlResponse} from '../api/url-api';
import {copyShortUrl, normalizeUrl, validate} from '../utils/url';
import {showToast} from '../utils/toast-util';
import {useShortenUrl} from '@/hooks/use-shorten-url';
import {DatePicker} from '@/components/ui/date-picker';
import {HistorySheet} from '@/components/history-sheet';
import {SHORT_CODE_LEN} from '@/constants';
import {Separator} from '@/components/ui/separator';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';

export function HomePage() {
    const [url, setUrl] = useState('');
    const [err, setErr] = useState('');
    const shortenMutation = useShortenUrl();
    const [dialog, setDialog] = useState(false);
    const [expiryDate, setExpiryDate] = useState<Date>();
    const [tag, setTag] = useState('');
    const [options, setOptions] = useState<string[]>([]);
    const sampleGeneratedUrl = (window.location.origin) + '/' + "*".repeat(SHORT_CODE_LEN);

    function handleOnChange(value: string) {
        setUrl(value);
        setErr('');
    }

    function handleSubmit(skipLengthWarning: boolean = false) {
        const validationError = validate(url);
        setErr(validationError);

        if(validationError) return;

        if(!skipLengthWarning && sampleGeneratedUrl.length > normalizeUrl(url).length) {
            setDialog(true);
            return;
        }

        shortenMutation.mutate({
            url,
            tag: options.includes('tag') && tag.trim() ? tag.trim() : undefined,
            expiryDate: expiryDate ? expiryDate.toISOString() : undefined
        }, {
            onSuccess: async (data: ShortenUrlResponse) => {
                const shortUrl = await copyShortUrl(data.shortCode);
                showToast("URL Shortened!", `Copied to clipboard - ${shortUrl}`, "success");
            },
            onError: (error) => {
                showToast("Something went wrong", `${error.message}`, "error");
                setErr(error.message);
            }
        });
    }

    return <div className="flex flex-1 flex-col items-center justify-center py-8 sm:py-12">
        <section className="w-full max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Make every link <span className="text-primary">feel effortless.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-sm leading-6 text-muted-foreground sm:text-base">
                Transform unwieldy URLs into tidy links in seconds. Paste your destination below and we’ll handle the rest.
            </p>
            <Card className="relative mt-9 w-full border border-border/70 bg-card/90 text-left shadow-xl shadow-primary/5 backdrop-blur sm:mt-10">
                <CardHeader className="border-b border-border/60 pb-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Link2 className="size-4" /></span>
                                Create a short link
                            </CardTitle>
                            <CardDescription className="mt-1.5">Enter any valid web address to get started.</CardDescription>
                        </div>
                        <span className="hidden items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground sm:flex">
                            <LockKeyholeOpen className="size-3" /> No account required
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="pt-1">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}>
                        <UrlInput
                            autoFocus
                            onChange={handleOnChange}
                            value={url}
                            placeholder="https://www.example.com"
                        />

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <ToggleGroup multiple value={options} onValueChange={setOptions}>
                                <Tooltip>
                                    <TooltipTrigger render={
                                        <ToggleGroupItem className='rounded-xl px-3 aria-pressed:border-primary/30 aria-pressed:bg-primary/10 aria-pressed:text-primary' variant='outline' value="tag" aria-label="Toggle tag">
                                            <Tag /> Tag
                                        </ToggleGroupItem>
                                    } />
                                    <TooltipContent>Add a name to your link</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger render={
                                        <ToggleGroupItem className='rounded-xl px-3 aria-pressed:border-primary/30 aria-pressed:bg-primary/10 aria-pressed:text-primary' variant='outline' value="expiry" aria-label="Toggle expiry">
                                            <ClockFading /> Expiry
                                        </ToggleGroupItem>
                                    } />
                                    <TooltipContent>Set your link to expire</TooltipContent>
                                </Tooltip>
                            </ToggleGroup>
                            <span className="text-xs text-muted-foreground">Optional settings</span>
                        </div>

                        {(options.includes('tag') || options.includes('expiry')) &&
                            <div className={`mt-4 grid w-full gap-4 rounded-xl border border-border/60 bg-muted/40 p-4 ${options.includes('tag') && options.includes('expiry') ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                                {options.includes('tag') && <div className="flex flex-col gap-2">
                                    <Label htmlFor="tag">Tag</Label>
                                    <Input className='text-xs sm:text-base' id="tag" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g. Instagram" />
                                </div>}
                                {options.includes('expiry') &&
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="expiry-date">Expiry date</Label>
                                        <DatePicker id="expiry-date" value={expiryDate} onChange={(e) => {setExpiryDate(e); setErr('');}} placeholder="Select a date" />
                                    </div>
                                }
                            </div>
                        }
                        {err && <p role="alert" className="mt-3 text-xs text-destructive sm:text-sm">{err}</p>}

                        <Button type="submit"
                            className="mt-5 h-11 w-full rounded-xl text-sm shadow-sm shadow-primary/20"
                            disabled={url == '' || shortenMutation.isPending}
                        >
                            {shortenMutation.isPending ? (
                                <>
                                    <Spinner></Spinner> Shortening...
                                </>
                            ) : (
                                <><Zap className="size-4" /> Shorten my link</>
                            )}{' '}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="mt-6 flex justify-center">
                <HistorySheet></HistorySheet>
            </div>
        </section>

        <StbAlertDialog
            open={dialog}
            title={'Shortened URL is longer'}
            description={
                <div className="space-y-4">
                    <div>
                        The generated URL will be <b>longer</b> than your original URL.
                    </div>

                    <div className="rounded-md border bg-muted/50 p-3 space-y-3">
                        <div>
                            <p className="mb-1 text-xs text-muted-foreground">
                                Original URL
                            </p>
                            <p className="break-all text-sm font-medium">
                                {normalizeUrl(url)}
                            </p>
                        </div>

                        <Separator />

                        <div>
                            <p className="mb-1 text-xs text-muted-foreground">
                                Generated URL
                            </p>
                            <p className="break-all text-sm font-medium">
                                {sampleGeneratedUrl}
                            </p>
                        </div>
                    </div>

                    <p>Do you want to continue?</p>
                </div>
            }
            onConfirm={() => {
                handleSubmit(true);
                setDialog(false);
            }}
            onClose={() => {
                setDialog(false);
            }}
        ></StbAlertDialog>
    </div>;
}
