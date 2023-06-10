import { createContext, useState } from "react";

type FilterType = "channel_announcement" | "message_report" | null
export const FilterContext = createContext({
  filterType: null as FilterType,
  setFilterType: null as any,
  filteredBy: null as any,
  setFilter: null as any,
});

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filterType, setFilterType] = useState<FilterType>(null);
  const [filteredBy, setFilter] = useState<any>(null);
  return (
    <FilterContext.Provider value={{filterType, setFilterType, filteredBy, setFilter}}>
      {children}
    </FilterContext.Provider>
  );
}