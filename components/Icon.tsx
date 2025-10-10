
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: 'sun' | 'moon' | 'upload' | 'download' | 'logo';
}

const ICONS: Record<IconProps['name'], React.ReactNode> = {
  sun: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />,
  moon: <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />,
  upload: <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />,
  download: <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />,
  logo: <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.251.042.506.096.762.162m-1.514 8.24c.465-.304.97-.534 1.514-.698m-1.514-1.422a3.75 3.75 0 00-3 0M14.25 3.104c.251.042.506.096.762.162m-1.514 8.24c.465-.304.97-.534 1.514-.698m-1.514-1.422a3.75 3.75 0 00-3 0M6.364 16.064c.256-.051.518-.094.786-.128m1.572-1.256a3.75 3.75 0 013.75 0M16.136 16.064c.256-.051.518-.094.786-.128m-1.572-1.256a3.75 3.75 0 013.75 0" />,
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
