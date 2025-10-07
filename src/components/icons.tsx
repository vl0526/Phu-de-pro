import type { SVGProps } from "react";

export function AppLogo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 0.7 }} />
                </linearGradient>
            </defs>
            <path
                d="M12.55,3.32a2,2,0,0,0-1.1,0L5.3,6.6A2,2,0,0,0,4,8.47V15.5a2,2,0,0,0,1.3,1.87l6.15,3.28a2,2,0,0,0,1.1,0l6.15-3.28A2,2,0,0,0,20,15.51V8.47a2,2,0,0,0-1.3-1.87Z"
                fill="url(#grad1)"
            />
            <path
                d="M12.55,3.32a2,2,0,0,0-1.1,0L5.3,6.6A2,2,0,0,0,4,8.47V15.5a2,2,0,0,0,1.3,1.87l6.15,3.28a2,2,0,0,0,1.1,0l6.15-3.28A2,2,0,0,0,20,15.51V8.47a2,2,0,0,0-1.3-1.87Z"
                stroke="hsl(var(--primary-foreground))"
                strokeOpacity="0.2"
                strokeWidth="1"
            />
            <path
                d="M8.5 14.5V12.5C8.5 11.12 9.62 10 11 10H13M15.5 9.5V11.5C15.5 12.88 14.38 14 13 14H11"
                stroke="hsl(var(--primary-foreground))"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}
