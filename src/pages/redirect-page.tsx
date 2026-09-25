import {useEffect, useState} from "react";
import {Skeleton} from "../components/ui/skeleton";
import {Link, useParams} from "react-router-dom";
import {ApiError, makeRequest} from "../utils/http";

interface UrlLookupResponse {
    url: string;
    expiryDate: string | null;
}

interface ExpiredUrlResponse {
    expired: true;
    expiryDate: string | null;
}

function isExpiredResponse(body: unknown): body is ExpiredUrlResponse {
    return typeof body === 'object' && body !== null && (body as {expired?: unknown;}).expired === true;
}

export function RedirectPage() {
    const [originalUrl, setOriginalUrl] = useState('');
    const {shortCode} = useParams<{shortCode: string;}>();
    const [expiryDate, setExpiryDate] = useState('');
    const [expired, setExpired] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if(!shortCode) return;

        async function fetchUrl() {
            try {
                const data = await makeRequest<UrlLookupResponse>(`/api/urls/${shortCode}`);
                setOriginalUrl(data.url);
                setExpiryDate(data.expiryDate ?? '');
            } catch(error) {
                // An expired link is an expected outcome, so it gets its own state
                // instead of being reported as an error.
                if(error instanceof ApiError && isExpiredResponse(error.body)) {
                    setExpired(true);
                    setExpiryDate(error.body.expiryDate ?? '');
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
                        <div className="flex justify-center flex-1 text-gray-400 break-all sm:w-1/3">{errorMessage}</div>
                        <p className="text-xs text-gray-600 mt-3">Create a new short link <Link to='/' className="underline animate-pulse">here</Link>.</p>
                    </>
                }

                {
                    !errorMessage && !expired &&
                    <>
                        <p className="pb-1 animate-pulse">Redirecting you to...</p>
                        <div className="flex justify-center flex-1 text-gray-400 break-all sm:w-1/3">{originalUrl}</div>
                        {expiryDate && <p className="text-xs text-gray-600 mt-3">Expires at {new Date(expiryDate).toLocaleString('en-SG')}</p>}
                        <div className="flex items-center gap-4 pt-4 w-full min-w-0 sm:w-2/5">
                            <Skeleton className="h-12 w-12 shrink-0 rounded-full bg-gray-200" />
                            <div className="min-w-0 flex-1 space-y-2">
                                <Skeleton className="h-4 w-full bg-gray-200" />
                                <Skeleton className="h-4 w-3/4 bg-gray-200" />
                            </div>
                        </div>
                    </>
                }

                {
                    !errorMessage && expired &&
                    <>
                        <p className="pb-1">URL expired, create a new one <Link to='/' className="underline animate-pulse">here</Link>...</p><div className="text-gray-400">{originalUrl}</div>
                        {expiryDate && <p className="text-xs text-gray-600 mt-3">Expired at {new Date(expiryDate).toLocaleString('en-SG')}</p>}
                    </>
                }
            </div >
        </>
    );
}
