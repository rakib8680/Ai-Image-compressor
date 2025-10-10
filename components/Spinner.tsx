
import React from 'react';

export const Spinner: React.FC = () => {
  return (
    <div className="w-10 h-10 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spinner-ease-spin" role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};
