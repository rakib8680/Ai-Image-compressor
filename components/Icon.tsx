import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: 'sun' | 'moon' | 'upload' | 'download' | 'logo' | 'github' | 'start-over' | 'refresh' | 'close' | 'zoom-in' | 'zoom-out' | 'reset' | 'compare' | 'savings' | 'side-by-side' | 'crop';
}

const ICONS: Record<IconProps['name'], React.ReactNode> = {
  sun: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />,
  moon: <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />,
  upload: <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />,
  download: <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />,
  logo: <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.251.042.506.096.762.162m-1.514 8.24c.465-.304.97-.534 1.514-.698m-1.514-1.422a3.75 3.75 0 00-3 0M14.25 3.104c.251.042.506.096.762.162m-1.514 8.24c.465-.304.97-.534 1.514-.698m-1.514-1.422a3.75 3.75 0 00-3 0M6.364 16.064c.256-.051.518-.094.786-.128m1.572-1.256a3.75 3.75 0 013.75 0M16.136 16.064c.256-.051.518-.094.786-.128m-1.572-1.256a3.75 3.75 0 013.75 0" />,
  github: <path strokeLinecap="round" strokeLinejoin="round" d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />,
  'start-over': <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />,
  'refresh': <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120 12h-3a6 6 0 00-5.23-5.94L10 6M20 20l-1.5-1.5A9 9 0 014 12h3a6 6 0 005.23 5.94L14 18" />,
  'close': <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
  'zoom-in': <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />,
  'zoom-out': <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />,
  'reset': <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  'compare': <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m-4-8h8M4 4h2v16H4zm12 0h2v16h-2z" />,
  'savings': <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 21.75c-2.43 0-4.68-.616-6.62-1.74C3.38 18.995 2.25 17.14 2.25 15c0-2.31.86-4.43 2.25-5.918M12 21.75c2.43 0 4.68-.616 6.62-1.74 2.05-1.18 3.13-3.03 3.13-5.01 0-2.31-.86-4.43-2.25-5.918" />,
  'side-by-side': <path strokeLinecap="round" strokeLinejoin="round" d="M6 2H4v20h2V2zm7 0h-2v20h2V2zm7 0h-2v20h2V2z" />,
  'crop': <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v4a1 1 0 001 1h4m4 8v4a1 1 0 01-1 1h-4m-8-8H3a1 1 0 00-1 1v4m16-8h4a1 1 0 011 1v4" />,
};

export const Icon: React.FC<IconProps> = ({ name, className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      {...props}
    >
      {ICONS[name]}
    </svg>
  );
};
