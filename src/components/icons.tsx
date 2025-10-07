import type { SVGProps } from "react";

export function AppLogo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <rect width="18" height="14" x="3" y="5" rx="2" ry="2" />
            <path d="M7 15h4" />
            <path d="M15 15h2" />
            <path d="M7 11h2" />
            <path d="M13 11h4" />
        </svg>
    )
}
