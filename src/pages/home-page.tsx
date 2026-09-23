
import {useState} from 'react';
import {Spinner} from '../components/ui/spinner';
import {Button} from '../components/ui/button';
import {Card, CardFooter} from '../components/ui/card';
import UrlInput from '../components/url-input';
import {ToggleGroup, ToggleGroupItem} from '../components/ui/toggle-group';
import {StbAlertDialog} from '../components/stb-alert-dialog';
import {ClockFading} from 'lucide-react';
import {Tooltip, TooltipContent, TooltipTrigger} from '../components/ui/tooltip';
import type {ShortenUrlResponse} from '../api/url-api';
import {copyShortUrl, normalizeUrl, validate} from '../utils/url';
import {showToast} from '../utils/toast-util';
import {useShortenUrl} from '@/hooks/use-shorten-url';
import {DatePicker} from '@/components/ui/date-picker';
import {HistorySheet} from '@/components/history-sheet';
import {SHORT_CODE_LEN} from '@/constants';
import {Separator} from '@/components/ui/separator';

export function HomePage() {
    const [url, setUrl] = useState('');
    const [err, setErr] = useState('');
    const shortenMutation = useShortenUrl();
    const [dialog, setDialog] = useState(false);
    const [expiryDate, setExpiryDate] = useState<Date>();
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

    return <>
        <div className="flex flex-1 w-full items-center justify-center">
            <Card className="flex w-full sm:w-1/2 mx-3 px-6 items-center">
                <form className='' onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}>
                    <UrlInput
                        onChange={handleOnChange}
                        value={url}
                        placeholder="https://www.example.com"
                    />

                    {options.includes('expiry') &&
                        <div className='pt-4 w-full'>
                            <DatePicker value={expiryDate} onChange={(e) => {setExpiryDate(e); setErr('');}} placeholder='Expiry date'></DatePicker>
                        </div>
                    }
                    {err && <p className="text-red-600 ml-4 mt-4 text-xs sm:text-sm">{err}</p>}

                    <CardFooter className="items-center content-center">
                        <Button
                            className="w-full mt-4 text-xs md:text-sm"
                            disabled={err != '' || url == '' || shortenMutation.isPending}
                            onClick={() => handleSubmit()}
                        >
                            {shortenMutation.isPending ? (
                                <>
                                    <Spinner></Spinner> Shortening...
                                </>
                            ) : (
                                'Shorten'
                            )}{' '}
                        </Button>
                    </CardFooter>
                </form>

            </Card>

            <StbAlertDialog
                open={dialog}
                title={'Shortened URL is longer'}
                description={
                    <div className="space-y-4">
                        <p>
                            The generated URL will be <b>longer</b> than your original URL.
                        </p>

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
        </div>
        <HistorySheet></HistorySheet>

        <div>
            <ToggleGroup multiple value={options} onValueChange={setOptions}>
                <Tooltip>
                    <TooltipTrigger render={
                        <ToggleGroupItem className='p-5 aria-pressed:bg-blue-400 aria-pressed:text-white' variant='outline' value="expiry" aria-label="Toggle expiry">
                            <ClockFading /> Expiry
                        </ToggleGroupItem>
                    }>
                    </TooltipTrigger>
                    <TooltipContent>
                        Set your link to expire
                    </TooltipContent>
                </Tooltip>
            </ToggleGroup>
        </div></>;
}