"use client";

import {
  createContext, useContext, useState, useEffect, useCallback,
  type ReactNode,
} from "react";
import { ORGS, type SalesforceOrg } from "@/lib/orgs";

const STORAGE_KEY = "sfauto_selectedOrgId";

interface OrgContextValue {
  selectedOrg: SalesforceOrg;
  selectOrg: (id: string) => void;
  orgs: SalesforceOrg[];
}

const OrgContext = createContext<OrgContextValue>({
  selectedOrg: ORGS[0],
  selectOrg: () => {},
  orgs: ORGS,
});

export function OrgProvider({ children }: { children: ReactNode }) {
  const [selectedOrgId, setSelectedOrgId] = useState<string>(ORGS[0].id);

  // localStorageから復元
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ORGS.some((o) => o.id === saved)) {
      setSelectedOrgId(saved);
    }
  }, []);

  const selectOrg = useCallback((id: string) => {
    setSelectedOrgId(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const selectedOrg = ORGS.find((o) => o.id === selectedOrgId) ?? ORGS[0];

  return (
    <OrgContext.Provider value={{ selectedOrg, selectOrg, orgs: ORGS }}>
      {children}
    </OrgContext.Provider>
  );
}

export const useOrg = () => useContext(OrgContext);
