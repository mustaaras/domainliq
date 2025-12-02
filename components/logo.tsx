import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
}

export function Logo({ className, ...props }: LogoProps) {
    return (
        <svg
            width="300"
            height="80"
            viewBox="0 0 300 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`dark:text-white text-gray-900 ${className || ''}`}
            {...props}
        >
            <defs>
                <linearGradient id="fusionGradText" x1="0" y1="0" x2="0" y2="80" gradientUnits="userSpaceOnUse">
                    <stop offset="0.4" stopColor="currentColor" />
                    <stop offset="1" stopColor="#FFD700" />
                </linearGradient>
            </defs>

            {/* Icon Part */}
            <g transform="translate(15, 10) scale(0.6)">
                {/* Circle */}
                <circle cx="45" cy="50" r="35" stroke="url(#fusionGradText)" strokeWidth="12" />
                {/* Vertical Line */}
                <path d="M80 0V100" stroke="url(#fusionGradText)" strokeWidth="12" strokeLinecap="round" />
            </g>

            {/* Text Part */}
            <text
                x="85"
                y="52"
                fontFamily="Inter, system-ui, sans-serif"
                fontWeight="700"
                fontSize="36"
                fill="currentColor"
                letterSpacing="-0.5"
            >
                domain<tspan fill="#FFD700">liq</tspan>
            </text>
        </svg>
    );
}
