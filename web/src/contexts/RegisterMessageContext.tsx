import { createContext, useState } from "react";

export const RegisterMessageContext = createContext({
  reportBox: null as any,
  setReportBox: null as any,
});

export function RegisterMessageProvider({ children }: { children: React.ReactNode }) {
  const [reportBox, setReportBox] = useState<any>(null);
  return (
    <RegisterMessageContext.Provider value={{reportBox, setReportBox}}>
      {children}
    </RegisterMessageContext.Provider>
  );
}