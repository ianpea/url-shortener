import {useEffect, useState} from "react";
import {Skeleton} from "../components/ui/skeleton";
import {Link, useParams} from "react-router-dom";


export function RedirectPage() {
    const [originalUrl, setOriginalUrl] = useState('');
    const {shortCode} = useParams<{shortCode: string;}>();
    const [expiryDate, setExpiryDate] = useState('');
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        if(!shortCode) return;
        async function fetchUrl() {
            const response = await fetch(`/api/urls/${shortCode}`);

            if(!response.ok) {
                const data = await response.json();
                if(data.expired) {
                    setExpired(true);
                    setExpiryDate(data.expiryDate);
                    return;
                }
            }

            const data = await response.json();
            // todo: type the data if possible?
            setOriginalUrl(data.url);
            setExpiryDate(data.expiryDate);
        }

        void fetchUrl();

    }, [shortCode]);

    useEffect(() => {
        if(!originalUrl) return;
        const timer = setTimeout(() => {
            window.location.href = originalUrl;
        }, 30000);

        return () => clearTimeout(timer);
    }, [originalUrl, expired]);

    return (
        <>
            <div className="flex flex-col items-center text-sm w-full">
                {
                    !expired &&
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
                    expired &&
                    <>
                        <p className="pb-1">URL expired, create a new one <Link to='/' className="underline animate-pulse">here</Link>...</p><div className="text-gray-400">{originalUrl}</div>
                        {expiryDate && <p className="text-xs text-gray-600 mt-3">Expired at {new Date(expiryDate).toLocaleString('en-SG')}</p>}
                    </>
                }
            </div >
        </>
    );
}