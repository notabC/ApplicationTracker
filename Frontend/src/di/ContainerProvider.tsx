import React from 'react';




interface ContainerProviderProps {
  children: React.ReactNode;
}

export const ContainerProvider: React.FC<ContainerProviderProps> = ({ children }) => {
  return <>{children}</>;
};