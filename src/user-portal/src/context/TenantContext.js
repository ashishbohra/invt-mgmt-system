import { createContext, useContext, useState, useEffect } from 'react';
import { tenantApi } from '../services/api';

const TenantContext = createContext();

export function TenantProvider({ children }) {
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);

  useEffect(() => {
    tenantApi.list({}).then(({ data }) => {
      const list = data.data || [];
      setTenants(list);
      if (list.length > 0) setSelectedTenant(list[0].id);
    });
  }, []);

  return (
    <TenantContext.Provider value={{ tenants, selectedTenant, setSelectedTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
