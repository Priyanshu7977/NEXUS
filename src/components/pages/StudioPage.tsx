import React from 'react';
import { OnePromptAppStudio } from '../studio/OnePromptAppStudio';

export const StudioPage: React.FC = () => {
  return (
    <div className="w-full text-left py-2 sm:py-4">
      <OnePromptAppStudio />
    </div>
  );
};

export default StudioPage;
