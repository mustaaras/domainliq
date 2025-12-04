import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getProfileUrl(subdomain: string) {
    if (process.env.NODE_ENV === 'development') {
        return `http://${subdomain}.localhost:3000`;
    }
    return `https://${subdomain}.domainliq.com`;
}

export function getMainDomainUrl() {
    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:3000';
    }
    return 'https://domainliq.com';
}
