import React, { useEffect } from 'react';
import BarcodeSearch from './components/barCodeSearch';
import ToolRegister from './components/toolRegister';
import Login from './components/login';
import HeldInvoices from './components/HeldInvoices';
import ReOrderManagement from './components/ReOrderManagement';
import SettlementTable from './components/receivedPayments';
import AddUserForm from './components/collectCustomerDetails';
import AdminPortal from './components/adminPortal';
import ProductManagement from './components/productManagement';

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { InvoiceProvider } from './components/InvoiceContext';
import BillingPurchaseTool from './components/purchase';
// import AuthContext from './components/context/AuthProvider';
// import { AuthProvider, useAuth } from './components/context/AuthProvider';


import './App.css';

const App = () => {
  // const { auth } = useAuth();
  // const { isAuthenticated, role } = auth;
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('role');
  const isAuthenticated = token ? true : false;

  useEffect(() => {
    const initializeSession = () => {
      console.log('Initializing session...');
   
      console.log("Current Role: ",role);

    };

    initializeSession();
  }, [isAuthenticated]);

  return (

      <InvoiceProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<ToolRegister />} />
            <Route path="/tool" element={<BarcodeSearch />} />
            <Route path="/held-invoices" element={<HeldInvoices />} />
            <Route
              path="/admin-portal"
              // element={isAuthenticated && role === 'Admin' ? <AdminPortal /> : <Navigate to="/" />}
              element={<AdminPortal />}
            />
            <Route path="/purchase" element={<BillingPurchaseTool />} />
            <Route path="/reorder-management" element={<ReOrderManagement />} />
            <Route path="/received-payments" element={<SettlementTable />} />
            <Route path="/add-customer" element={<AddUserForm />} />
            <Route path="/product-management" element={<ProductManagement />} />
          </Routes>
        </Router>
      </InvoiceProvider>
  );
};

export default App;
