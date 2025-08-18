import React, { createContext } from "react";

const AuthContext = createContext(null);
export { AuthContext };

export const AuthProvider = ({ children }) => {
  // Solo estructura básica, sin lógica de login ni backend
  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
};