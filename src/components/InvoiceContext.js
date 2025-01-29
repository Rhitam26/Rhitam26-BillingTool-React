import React, { createContext, useState } from 'react';

// Create the context
export const InvoiceContext = createContext();

// Create a provider component
export const InvoiceProvider = ({ children }) => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  return (
    <InvoiceContext.Provider value={{ selectedInvoice, setSelectedInvoice }}>
      {children}
    </InvoiceContext.Provider>
  );
};
  