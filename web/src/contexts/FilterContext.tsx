import { createContext, useState } from "react";

export const FilterContext = createContext({
  filteredBy: null as any,
  setFilter: null as any,
});

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filteredBy, setFilter] = useState<any>(null);
  return (
    <FilterContext.Provider value={{filteredBy, setFilter}}>
      {children}
    </FilterContext.Provider>
  );
}