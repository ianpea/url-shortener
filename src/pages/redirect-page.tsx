import {useEffect, useState} from "react";
import {Skeleton} from "../components/ui/skeleton";
import {Link, useParams} from "react-router-dom";
import {ApiError, makeRequest} from "../utils/http";
import {formatExpiry} from "../utils/date";
import {Badge} from "../components/ui/badge";
import {Tag} from "lucide-react";

interface UrlLookupResponse {
    url: string;
    expiryDate: string | null;
    tag: string | null;
}

interface ExpiredUrlResponse {
    expired: true;
    expiryDate: string | null;
    tag: string | null;
}

function isExpiredResponse(body: unknown): body is ExpiredUrlResponse {
    return typeof body === 'object' && body !== null && (body as {expired?: unknown;}).expired === true;
}

export function RedirectPage() {
    const [originalUrl, setOriginalUrl] = useState('');
    const {shortCode} = useParams<{shortCode: string;}>();
    const [expiryDate, setExpiryDate] = useState('');
    const [tag, setTag] = useState('');
    const [expired, setExpired] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if(!shortCode) return;

        async function fetchUrl() {
            try {
                const data = await makeRequest<UrlLookupResponse>(`/api/urls/${shortCode}`);
                setOriginalUrl(data.url);
                setExpiryDate(data.expiryDate ?? '');
                setTag(data.tag ?? '');
            } catch(error) {
                // An expired link is an expected outcome, so it gets its own state
                // instead of being reported as an error.
                if(error instanceof ApiError && isExpiredResponse(error.body)) {
                    setExpired(true);
                    setExpiryDate(error.body.expiryDate ?? '');
                    setTag(error.body.tag ?? '');
                    return;
                }

                setErrorMessage(
                    error instanceof ApiError
                        ? error.message
                        : 'Something went wrong, please try again.'
                );
            }
        }

        void fetchUrl();

    }, [shortCode]);

    useEffect(() => {
        if(!originalUrl) return;
        const timer = setTimeout(() => {
            window.location.href = originalUrl;
        }, 3000);

        return () => clearTimeout(timer);
    }, [originalUrl, expired]);

    return (
        <>
            <div className="flex w-full flex-1 flex-col items-center justify-center py-12 text-sm sm:py-16">
                {
                    errorMessage &&
                    <>
                        <p className="pb-1">Unable to open that link.</p>
                        <div className="flex w-full justify-center px-4 text-gray-400 break-all sm:w-1/3">{errorMessage}</div>
                        <p className="mt-3 text-xs text-gray-600">Create a new short link <Link to='/' className="underline animate-pulse">here</Link>.</p>
                    </>
                }

                {
                    !errorMessage && !expired &&
                    <>
                        <p className="pb-1 animate-pulse">Redirecting you to...</p>
                        <div className="flex w-full justify-center px-4 text-gray-400 break-all sm:w-1/3">{originalUrl}</div>
                        {tag && <Badge variant="outline" className="mt-3"><Tag className="size-3" />{tag}</Badge>}
                        {expiryDate && <p className="mt-3 text-xs text-gray-600">Expires at {formatExpiry(expiryDate)}</p>}
                        <div className="mt-4 flex w-full flex-col items-center gap-2">
                            <Skeleton className="h-4 w-3/4 max-w-md bg-gray-200" />
                            <Skeleton className="h-4 w-1/2 max-w-sm bg-gray-200" />
                        </div>
                    </>
                }

                {
                    !errorMessage && expired &&
                    <>
                        <p className="pb-1">URL expired, create a new one <Link to='/' className="underline animate-pulse">here</Link>...</p>
                        <div className="w-full px-4 text-center text-gray-400 break-all sm:w-1/3">{originalUrl}</div>
                        {tag && <Badge variant="outline" className="mt-3"><Tag className="size-3" />{tag}</Badge>}
                        {expiryDate && <p className="mt-3 text-xs text-gray-600">Expired at {formatExpiry(expiryDate)}</p>}
                    </>
                }
            </div >
        </>
    );
}
