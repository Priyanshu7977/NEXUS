import React from 'react';
import { MultiModelSwarm } from '../swarm/MultiModelSwarm';

export const SwarmPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0D0F14] text-white">
      <MultiModelSwarm />
    </div>
  );
};
