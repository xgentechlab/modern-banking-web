import React, { createContext, useContext, useState } from 'react';

export const ModuleContext = createContext();

export const useModule = () => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useModule must be used within a ModuleProvider');
  }
  return context;
};

export const ModuleProvider = ({ children }) => {
  const [activeModule, setActiveModule] = useState(null);
  const [moduleHistory, setModuleHistory] = useState([]);
  const [moduleData, setModuleData] = useState({});

  const handleModuleChange = (newModule, data = {}) => {
    if (activeModule) {
      setModuleHistory(prev => [...prev, activeModule]);
    }
    setActiveModule(newModule);
    setModuleData(data);
  };

  const handleModuleBack = () => {
    if (moduleHistory.length > 0) {
      const previousModule = moduleHistory[moduleHistory.length - 1];
      setActiveModule(previousModule);
      setModuleHistory(prev => prev.slice(0, -1));
    }
  };

  const clearModuleState = () => {
    setActiveModule(null);
    setModuleHistory([]);
    setModuleData({});
  };

  return (
    <ModuleContext.Provider value={{
      activeModule,
      moduleHistory,
      moduleData,
      handleModuleChange,
      handleModuleBack,
      clearModuleState
    }}>
      {children}
    </ModuleContext.Provider>
  );
}; 