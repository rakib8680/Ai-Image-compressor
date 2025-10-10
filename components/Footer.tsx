import React from 'react';
import { Icon } from './Icon';

export const Footer: React.FC = () => {
    return (
        <footer className="w-full py-4 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-slate-400 text-sm">
                <p>
                    Made with <span className="text-red-500">❤️</span> by Rakib. 
                    <a 
                        href="https://github.com/rakib8680" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 font-medium hover:text-brand-purple transition-colors inline-flex items-center gap-1"
                    >
                        <Icon name="github" className="w-4 h-4" />
                        GitHub
                    </a>
                </p>
            </div>
        </footer>
    );
};