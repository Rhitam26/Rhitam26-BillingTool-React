import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import Popup from './popUp';

import  PrintButton from './PrintButton'
// import Select from 'react-select';
import'./styles.css';
import { type } from '@testing-library/user-event/dist/type';


// Styled components for layout and styling
const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, #1a1c20 0%, #2d3436 100%);
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CustomerDisplayName = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border-radius: 8px;
  backdrop-filter: blur(10px);
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const NavLink = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 0.5rem 1rem;
  border-radius: 6px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }
`;

const Container = styled.div`
  width: 90%;
  max-width: 1400px;
  margin: 2rem auto;
  position: relative;
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const Select = styled.select`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  width: 100%;
  background: #f8fafc;
  transition: all 0.2s ease;
  font-size: 0.95rem;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  width: 250px;
  transition: all 0.2s ease;
  font-size: 0.95rem;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);
  }
`;

const SubmitButton = styled(Button)`
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 2rem;
  gap: 1rem;
`;

const HoldNewInvoiceButton = styled(Button)`
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
`;

const Th = styled.th`
  padding: 1rem;
  text-align: left;
  background: #f8fafc;
  font-weight: 600;
  color: #1e293b;
  border-bottom: 2px solid #e2e8f0;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8fafc;
  }
`;

const EditableInput = styled.input`
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  width: 100%;
  transition: all 0.2s ease;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const EditablePaymentEntries = styled.input`
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  width: 30%;
  transition: all 0.2s ease;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const DeleteButton = styled.button`
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;

  &:hover {
    transform: rotate(90deg);
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  }
`;

const TotalRow = styled.tr`
  background: #f8fafc;
  font-weight: 600;
  color: #1e293b;
`;

const Dropdown = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-width: 400px;
  z-index: 1000;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  list-style: none;
  padding: 0.5rem;
  margin: 0;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
`;

const SearchContainer = styled.div`
  top: 60px;
  left: 20px;
  width: 400px;
  z-index: 1000;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1rem;
`;

const CustomerSearchContainer = styled.div`
  position: relative;
  top: -100px;
  width: 400px;
  z-index: 1000;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-left: auto; // This will push it to the right
  margin-right: 20px; // Add some spacing from the right edge
`;

const CustomerContainer = styled.div`
  position: fixed;
  top: 60px;
  right: 420px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1rem;
`;

const DiscountRow = styled.tr`
  background: #f1f5f9;
  font-weight: 600;
  color: #1e293b;
`;

const ProductSelect = styled.select`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  width: 100%;
  background: #f8fafc;
  transition: all 0.2s ease;
  font-size: 0.95rem;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const HoldInvoicesButton = styled(Button)`
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  margin-top: 1.5rem;
`;

const CancelInvouceButton = styled(Button)`
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
`;

const ReceiptButton = styled(Button)`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
`;

const ReOrderManagemntButton = styled(Button)`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
`;
// call the API to get the products

const BarcodeSearch = () => {
  const [barcode, setBarcode] = useState('');
  const [products, setProducts] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  let [totalPrice, setTotalPrice] = useState(0);
  let [selectedOption, setSelectedOption] = useState(null);
  let [options, setOptions] = useState('');
  let [customers, setCustomers] = useState('');
  let [overallDiscount, setOverallDiscount] = useState(0);
  let [customerName, setCustomerName] = useState('Anonymous#'+Date.now());
  const [custResults, setCustResults] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [values, setValues] = useState('');
  const [transactionType, setTransactionType] = useState('Cash');
  const [paymentOption, setPaymentOption] = useState('');
  let amountSettled = 0;
  // const [invoiceData, setInvoiceData] = useState('');
  let invoiceId = '';
  const [upiPayment, setUpiPayment] = useState(0);
  const [cashPayment, setCashPayment] = useState(0);
  const [creditPayment, setCreditPayment] = useState(0);
  const [invoiceType, setInvoiceType] = useState('standard'); // 'standard', 'secondary', or 'hybrid'
  const [selectedForSecondary, setSelectedForSecondary] = useState(new Set());
  const [balance, setBalance] = useState(totalPrice);
  let [customerType, setCustomerType] = useState('');

  let [submissionType, setSubmissionType] = useState('Fresh');
  const location = useLocation();
  const navigate = useNavigate();
  const [primaryProducts, setPrimaryProducts] = useState([]);
  const [secondaryProducts, setSecondaryProducts] = useState([]);



  // totalPrice = parseFloat(products.reduce((acc, product) => acc + (parseFloat(product.price)-parseFloat(product.discount)) * parseInt(product.quantity), 0).toFixed(2));
  let settlement_amount = totalPrice - (parseFloat(upiPayment) + parseFloat(cashPayment)+ parseFloat(creditPayment));

  if (invoiceId === ''){
    invoiceId = Date.now();
  }

  let invoiceData = {
    invoiceId: invoiceId,
    data: {
      products: products
    }
  }
  const updateTotalPrice = () => {
    const newTotal = products.reduce((acc, product) => 
      acc + (parseFloat(product.price) - parseFloat(product.discount)) * parseInt(product.quantity), 0
    );
    setTotalPrice(newTotal);
  };


  const handleInvoiceTypeChange = (e) => {
    const newInvoiceType = e.target.value;
    setInvoiceType(newInvoiceType);

    // Update prices based on new invoice type
    setProducts(prevProducts => 
      prevProducts.map(product => {
        let newPrice;

        if (newInvoiceType === 'secondary') {
          // Set secondary prices
          console.log("INvoice Type chnage customer type:", customerType);
          switch (customerType) {
            case 'Gold':
              newPrice = product.kaccha_sales_price_1;
              break;
            case 'Silver':
              newPrice = product.kaccha_sales_price_2;
              break;
            case 'Platinum':
              newPrice = product.kaccha_sales_price_3;
              break;
            case 'Diamond':
              newPrice = product.kaccha_sales_price_4;
              break;
            default:
              newPrice = product.kaccha_default_price;
          }
        } else if (newInvoiceType === 'standard') {
          // Set standard prices
          switch (customerType) {
            case 'Gold':
              newPrice = product.price_gold;
              break;
            case 'Silver':
              newPrice = product.price_silver;
              break;
            case 'Platinum':
              newPrice = product.price_platinum;
              break;
            case 'Diamond':
              newPrice = product.price_diamond;
              break;
            default:
              newPrice = product.default_price;
          }
        } else if (newInvoiceType === 'hybrid') {
          // For hybrid, keep current prices but reset selections
          newPrice = product.price;
        }

        return {
          ...product,
          price: newPrice
        };
      })
    );

    // Reset secondary selections if switching from hybrid to another type
    if (newInvoiceType !== 'hybrid') {
      setSelectedForSecondary(new Set());
    }
  };
  const toggleProductSelection = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setSelectedForSecondary(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });

    // Update product price based on selection
    setProducts(prevProducts => 
      prevProducts.map(p => {
        if (p.id !== productId) return p;

        let newPrice;
        if (!selectedForSecondary.has(productId)) {
          // Switching to secondary price
          switch (customerType) {
            case 'Gold':
              newPrice = p.kaccha_sales_price_1;
              break;
            case 'Silver':
              newPrice = p.kaccha_sales_price_2;
              break;
            case 'Platinum':
              newPrice = p.kaccha_sales_price_3;
              break;
            case 'Diamond':
              newPrice = p.kaccha_sales_price_4;
              break;
            default:
              newPrice = p.kaccha_default_price;
          }
        } else {
          // Switching back to primary price
          switch (customerType) {
            case 'Gold':
              newPrice = p.price_gold;
              break;
            case 'Silver':
              newPrice = p.price_silver;
              break;
            case 'Platinum':
              newPrice = p.price_platinum;
              break;
            case 'Diamond':
              newPrice = p.price_diamond;
              break;
            default:
              newPrice = p.default_price;
          }
        }
        
        return {
          ...p,
          price: newPrice
        };
      })
    );

    // Update total price after price changes
    updateTotalPrice();
  };


// write a function that takes a dictionay of products and quanity and checks if the products are in stock
  const productsInStock = async (products) => {
    console.log('Checking for products .... :', products);
    // get the products from the google sheet
    const response = await axios.get(
      'https://sheets.googleapis.com/v4/spreadsheets/1YvUhfiX6oBVpl67x7gD4iiChZPis17aNgMVSSEHRak4/values/product!A:F?key=AIzaSyCCSlM3bNmnEd0CqUbX5C7znDyh2jKFQGU'
    );
    const current_stock = response.data.values;

    const out_of_stock = [];

    // check if the products are in stock
    for (let i = 0; i < products.length; i++) {
      let product = products[i];
      let found = current_stock.find((stock) => stock[0] === product.name);
      // console.log('found:', found);
      if (found){
        console.log('found:', found[4]);
        console.log('product quantity:', product.quantity);
        if (parseInt(found[4]) < parseInt(product.quantity)){
          out_of_stock.push(product);
        }
      }
    }
    console.log('out_of_stock:', out_of_stock);

    return out_of_stock;
  }


  const handleNewHoldInvoice =async () => {
    console.log('Hold Invoice');
    // console.log('products:', products);
    // generate the invoice number
    invoiceId = Date.now();

    if (customerName.startsWith('Anonymous#')) {
      setShowPopup(true);
      return;
    }

    const formattedProducts = products.map((product) => [product.name, product.price, product.quantity, product.discount]);
    // console.log('formattedProducts:', formattedProducts);
  

    const url ='http://127.0.0.1:5000/submit'

      submissionType = 'Hold';
      
      if (customerName.startsWith('Anonymous#')){
        setShowPopup(true);
      }
      else{
        const response = await axios.post(url, {
        products: formattedProducts,
        customerName : customerName,
        InvoiceNumber: String(invoiceId),
        invoice_status :submissionType,
        upi: upiPayment,
        cash: cashPayment,
        credit: creditPayment,
        amount_paid: totalPrice,
        date : String(Date.now())
      });

      alert('Invoice ID: ' + invoiceId + ' held successfully and is in HOLD state');


      // console.log('response:', response);
    // Clear products array after submission
    setTotalPrice(0);
    // Clear input after submission
    setBarcode('');
    sessionStorage.removeItem('invoiceData');

    // remove the data from the table
    setProducts([]);
    setTotalPrice(0);
    setOverallDiscount(0);
    setBarcode('');
    // Reload the page to create a new session

    } 

  };

  const handelCancelInvoice = () => {
    // console.log('Cancel Invoice');
  // clear the products array
  setProducts([]);
  setTotalPrice(0);
  setOverallDiscount(0);
  setBarcode('');
  sessionStorage.removeItem('invoiceData');
  };

  
  const handleSubmit = async () => {

    const formattedProducts = products.map((product) => [product.name, product.price, product.quantity, product.discount]);
   
    const out_of_stock = await productsInStock(products);

    if (out_of_stock.length > 0){
      alert('The following products are out of stock: ' + out_of_stock.map((product) => product.name).join(', '));
      return;
    }

    if (settlement_amount !== 0){
      alert('Please settle the amount before submission');
      return;
    }

    const primaryProds = products.filter(p => !selectedForSecondary.has(p.id));
    const secondaryProds = products.filter(p => selectedForSecondary.has(p.id));

    if (invoiceType === 'hybrid') {
      // Generate two invoice IDs
      const primaryInvoiceId = Date.now();
      const secondaryInvoiceId = primaryInvoiceId + 1;

      // Format products for API
      const formatProductsForAPI = (prods) => 
        prods.map(p => [p.name, p.price, p.quantity, p.discount]);

      try {
        // Submit primary invoice
        if (primaryProds.length > 0) {
          await axios.post('http://127.0.0.1:8000/gsheet-update-invoice', {
            products: formatProductsForAPI(primaryProds),
            InvoiceNumber: String(primaryInvoiceId),
            customerName,
            invoice_status: 'Primary',
            upi: upiPayment,
            cash: cashPayment,
            credit: creditPayment,
            amount_paid: primaryProds.reduce((acc, p) => 
              acc + (parseFloat(p.price) - parseFloat(p.discount)) * parseInt(p.quantity), 0),
            date: String(Date.now())
          });
        }

        // Submit secondary invoice
        if (secondaryProds.length > 0) {
          await axios.post('http://127.0.0.1:8000/gsheet-update-invoice', {
            products: formatProductsForAPI(secondaryProds),
            InvoiceNumber: String(secondaryInvoiceId),
            customerName,
            invoice_status: 'Secondary',
            upi: 0, // Split payments as needed
            cash: 0,
            credit: 0,
            amount_paid: secondaryProds.reduce((acc, p) => 
              acc + (parseFloat(p.price) - parseFloat(p.discount)) * parseInt(p.quantity), 0),
            date: String(Date.now())
          });
        }

        alert(`Hybrid invoices generated successfully:\nPrimary Invoice: ${primaryInvoiceId}\nSecondary Invoice: ${secondaryInvoiceId}`);
        
        // Reset state
        setProducts([]);
        setTotalPrice(0);
        setOverallDiscount(0);
        setBarcode('');
        setUpiPayment(0);
        setCashPayment(0);
        setCreditPayment(0);
        setSelectedForSecondary(new Set());

      } catch (error) {
        console.error('Error submitting hybrid invoices:', error);
        alert('Error generating invoices. Please try again.');
      }
    } else {


  

    const url ='http://127.0.0.1:8000/gsheet-update-invoice'
    
    try {
      if (submissionType === 'Fresh'){
        submissionType = 'Fresh';
      }
      else{
        submissionType = 'Hold';
      }
      if (customerName.startsWith('Anonymous#')){
        setShowPopup(true);
      }
      else{
    
        const response = await axios.post(url, {
        products: formattedProducts,
        InvoiceNumber: String(invoiceId),
        customerName : customerName,
        invoice_status :submissionType,
        upi: upiPayment,
        cash: cashPayment,
        credit: creditPayment,
        amount_paid: totalPrice,
        date : String(Date.now())
      });
      


      // show alert after submission
      alert('Invoice ID: ' + invoiceId + ' submitted successfully');
   
    // Clear products array after submission
    setTotalPrice(0);
    settlement_amount = 0;
    setUpiPayment(0);
    setCashPayment(0);
    setCreditPayment(0);

    
    // Clear input after submission
    setBarcode('');
    sessionStorage.removeItem('invoiceData');
    // location.state.invoiceData = null;
    console.log('location .... :', location);
// 
    // remove the data from the table
    setProducts([]);
    setTotalPrice(0);
    setOverallDiscount(0);
    setBarcode('');
    // Reload the page to create a new session
    }
    } catch (error) {
      console.error('Error submitting data:', error);
    }
    if (submissionType === 'Hold'){
      
      try{

        const response = await axios.post('http://127.0.0.1:5000/chnage_held_invocies', {
          invoiceId:invoiceId ,
          values: formattedProducts
        });
      // console.log('response:', response); 
        
    }
    catch (error) {
      console.error('Error deleting invoice:', error);
    }
  }
}
  };


  const handleKeyDown = (event) => {

    if (event.altKey && event.key === 'h') {
      handleNewHoldInvoice();
    } else if (event.key === 'F1') {
      handelCancelInvoice();
    } else if (event.altKey && event.key === 's') {
      handleSubmit();
    }
  };

  useEffect(() => {

    document.addEventListener('keydown', handleKeyDown);

    console.log('location:', location);

    if (customers.length === 0){  
      // console.log('Fetching customers...');
      getCustomers();
    }

    if (options.length === 0){
      // console.log('Fetching options...');
      getOptions();

    // print localStorage data
    console.log('localStorage:', localStorage);
    console.log('sessionStorage:', sessionStorage);

    }

    if (location.state && location.state.invoiceData && location.state.invoiceData.products) {
      // check if the user has pressed refresh
      
      const { invoiceData } = location.state;
      // console.log('invoiceData...:', invoiceData.products);
      // console.log(products)
      invoiceId = invoiceData.invoiceId;
      // setInvoiceId(invoiceId);
     

      const newProducts = invoiceData.products.map((product) => ({
        id : product[0],
        name : product[0],
        price : product[1],
        quantity : product[2],
        discount : product[3],
      }));
      setProducts(newProducts);
      submissionType = 'Hold';
      setSubmissionType(submissionType);
      

    }
      
  }, []);

  const handleTransactionTypeChange = (e) => {
    setTransactionType(e.target.value);
    setPaymentOption(''); // Reset payment option when transaction type changes
  };

  const handleAddCustomer = () => {
    setShowPopup(false); // Close the popup
    navigate('/add-customer'); // Redirect to add user form
  };

  // Function to handle "No" in popup
  const handleCancelPopup = () => {
    setShowPopup(false); // Close the popup
  };

  const handlePaymentOptionChange = (e) => {
    setPaymentOption(e.target.value);
  };
  const handleHoldInvoicesClick = () => {
    navigate('/held-invoices');
  };

 
  const handleReOrderManagement = () => {
    navigate('/re-order-management');
  };

  const handleRecievePayments = () => {
    navigate('/received-payments');
  };
  

sessionStorage.removeItem('invoiceData');



  const handleOverallDiscount = async () => {
    // console.log('overallDiscount:', overallDiscount);
    totalPrice = totalPrice - overallDiscount;
    setTotalPrice(totalPrice);
  }

  
const handleSearchChange = (e) => {
    const query = e.target.value;
    // console.log('query:', query);
    setValues(query);

  }

  const handleCustomerSearchChange = (e) => {
    const query = e.target.value;
    // console.log('cust query :', query);
    setCustResults(query);
  
  }


  const handleSearch = async () => {
    try {
      const response = await axios.get(
        'https://sheets.googleapis.com/v4/spreadsheets/1YvUhfiX6oBVpl67x7gD4iiChZPis17aNgMVSSEHRak4/values/product!A:Z?key=AIzaSyCCSlM3bNmnEd0CqUbX5C7znDyh2jKFQGU'
      );
  
      const rows = response.data.values;
      const foundProduct = rows.find((row) => row[1] === barcode || row[2] === barcode);
  
      if (foundProduct) {
        // Get customer type before proceeding
        let price = 0;
        let customerType = 'Normal';
        
        // Only check customer type if not anonymous
        if (!customerName.startsWith('Anonymous#')) {
          const customer = customers.find((customer) => customer[0] === customerName);
          if (customer) {
            customerType = customer[3]; // Get customer type (Gold, Silver, Platinum, Diamond)
          }
        }
  
        // Determine price based on invoice type and customer type
        if (invoiceType === 'secondary') {
          if (customerName.startsWith('Anonymous#')) {
            alert('Please select a customer for secondary invoice');
            return;
          }
          
          // Secondary invoice pricing
          switch (customerType) {
            case 'Gold':
              price = foundProduct[21]; // kaccha_sales_price_1
              break;
            case 'Silver':
              price = foundProduct[22]; // kaccha_sales_price_2
              break;
            case 'Platinum':
              price = foundProduct[23]; // kaccha_sales_price_3
              break;
            case 'Diamond':
              price = foundProduct[24]; // kaccha_sales_price_4
              break;
            default:
              price = foundProduct[20]; // kaccha_default_price
          }
        } else if (invoiceType === 'standard') {
          // Standard invoice pricing
          switch (customerType) {
            case 'Gold':
              price = foundProduct[11]; // price_gold
              break;
            case 'Silver':
              price = foundProduct[12]; // price_silver
              break;
            case 'Platinum':
              price = foundProduct[13]; // price_platinum
              break;
            case 'Diamond':
              price = foundProduct[14]; // price_diamond
              break;
            default:
              price = foundProduct[7]; // default_price
          }
        } else if (invoiceType === 'hybrid') {
          // For hybrid, start with standard pricing - it can be toggled to secondary later
          switch (customerType) {
            case 'Gold':
              price = foundProduct[11]; // price_gold
              break;
            case 'Silver':
              price = foundProduct[12]; // price_silver
              break;
            case 'Platinum':
              price = foundProduct[13]; // price_platinum
              break;
            case 'Diamond':
              price = foundProduct[14]; // price_diamond
              break;
            default:
              price = foundProduct[7]; // default_price
          }
        }
  
        // Add the product with determined price
        setProducts((prevProducts) => [
          ...prevProducts,
          {
            name: foundProduct[0],
            id: foundProduct[1],
            sec_id: foundProduct[2],
            category: foundProduct[3],
            type: foundProduct[4],
            company: foundProduct[5],
            brand: foundProduct[6],
            default_price: foundProduct[7],
            current_stock: foundProduct[8],
            min_stock: foundProduct[9],
            price_gold: foundProduct[11],
            price_silver: foundProduct[12],
            price_platinum: foundProduct[13],
            price_diamond: foundProduct[14],
            sales_price_5: foundProduct[15],
            sales_price_6: foundProduct[16],
            kaccha_purchase_price: foundProduct[19],
            kaccha_default_price: foundProduct[20],
            kaccha_sales_price_1: foundProduct[21],
            kaccha_sales_price_2: foundProduct[22],
            kaccha_sales_price_3: foundProduct[23],
            kaccha_sales_price_4: foundProduct[24],
            kaccha_sales_price_5: foundProduct[25],
            kaccha_sales_price_6: foundProduct[26],
            price: price, // Use the calculated price
            quantity: 1,
            discount: 0,
          },
        ]);
  
        // Update total price
        setTotalPrice((prevTotal) => {
          const newProducts = [...products, {
            price: price,
            quantity: 1,
            discount: 0
          }];
          return newProducts.reduce((acc, product) => 
            acc + (parseFloat(product.price) - parseFloat(product.discount)) * parseInt(product.quantity), 0
          );
        });
  
        setBarcode(''); // Clear input after search
      } else {
        alert('Product not found!');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleDelete = (id) => {
    setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
  };

  const handleEdit = (id, key, value) => {
    // console.log('id:', id);

    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, [key]: value } : product
      )
    );

    // get the latest quantity and price
    let price = products.find((product) => product.id === id).price;
    let quantity = products.find((product) => product.id === id).quantity;
    // get total discount
    let discount = products.find((product) => product.id === id).discount;  
    // for (let i = 0; i < products.length; i++) {
    //   discount += parseFloat(products[i].discount);
    // }
    console.log('discount 123:', discount);

    let price_till_now = 0;

    for (let i = 0; i < products.length; i++) {
      price_till_now += (parseFloat(products[i].price)- parseFloat(products[i].discount)) * parseInt(products[i].quantity);
      // console.log("PROduct Total ", parseFloat(products[i].price)- parseFloat(products[i].discount) * parseInt(products[i].quantity))
    }
    // console.log('price_till_now:', price_till_now);
  };

  const handlePayment = (invoice_id, key, value) => {
    setBalance(settlement_amount);

    if (key === 'upi'){
      setUpiPayment(value);
    }
    else if (key === 'cash'){
      setCashPayment(value);
    }
    else if (key === 'credit'){
      setCreditPayment(value);
    }

  }

  const getOptions = async () => {
    try {
      const response = await axios.get(
        'https://sheets.googleapis.com/v4/spreadsheets/1YvUhfiX6oBVpl67x7gD4iiChZPis17aNgMVSSEHRak4/values/Sheet1!A:C?key=AIzaSyCCSlM3bNmnEd0CqUbX5C7znDyh2jKFQGU'
      );
      const rows = response.data.values;
      // console.log('rowsqwe:', rows);
      // set the options
      options = rows;
      setOptions(options);
    } catch (error) {
      // console.error('Error fetching data:', error);
    }

  };


  const getCustomers = async () => {
    // console.log("INSIDE GET CUSTOMERS")
    try{
      const response = await axios.get(
        'https://sheets.googleapis.com/v4/spreadsheets/1YvUhfiX6oBVpl67x7gD4iiChZPis17aNgMVSSEHRak4/values/Sheet6!A:F?key=AIzaSyCCSlM3bNmnEd0CqUbX5C7znDyh2jKFQGU'
      );
      const rows = response.data.values;
      // console.log('rows:', rows);
      // set the customers
      customers = rows;
      setCustomers(customers);
      

    }
    catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchProducts = async (e) => {
    // console.log('selectedOption:', e);
    setValues(e);
    // console.log("Search:", searchTerm);
   
  }

  const fetchCustomers = async (e) => {
    // console.log('selectedOption:', e);
    setCustResults(e);
    // console.log("Search:", searchTerm);
    let temp_customerName = customers.find((customer) => customer[0] === e);
    // console.log('temp_customerName:', temp_customerName);
    setCustomerName(temp_customerName[0]);
    setCustomerType(temp_customerName[3]);

  }

  const handleLogout = () => {
    localStorage.clear();
    console.log('Logged out ...');
    navigate("/");
  };

  return (
    <>
     {/* Navbar */}
     <Navbar>
        <h2>VTel-Billing Tool</h2>
        <NavLinks>
          <NavLink onClick={() => navigate('/held-invoices')}>Old Held Invoices</NavLink>
          <NavLink onClick={() => navigate('/received-payments')}>Received/Receipt Payments</NavLink>
          <NavLink onClick={() => navigate('/reorder-management')}>Re-Order Management</NavLink>
          <NavLink onClick={() => navigate('/admin-portal')}>Admin Portal</NavLink>
          <NavLink onClick={() => handleLogout()}>LOGOUT</NavLink>
        </NavLinks>
      </Navbar>

    <Container>
    <div>
          <select value={invoiceType} onChange={handleInvoiceTypeChange}>
            <option value="standard">Standard Invoice</option>
            <option value="secondary">Secondary Invoice</option>
            <option value="hybrid">Hybrid Invoice</option>
          </select>
      </div>


      <SearchContainer>
        <div className='search-inner'>
          <input type="text" placeholder="Search Products" value={values} onChange={handleSearchChange} />
          <button onClick={()=> fetchProducts(values)}>Search</button>
          {options.length > 0 && (
            <div className='dropdown'>
              {options.filter(results =>{
                // console.log('results11:', values);
                return values && (results[0].toLowerCase().includes(values.toLowerCase()) || results[2].toLowerCase().includes(values.toLowerCase())) && (results[0].toLowerCase() !== values.toLocaleLowerCase())
                
              }).map((result) => (
                <div onClick={()=>fetchProducts(result[0])}  className='dropdown-item'>
                  {result[0]} - {result[2]}
                </div>          
))}
            </div>
          )}
        </div>

      </SearchContainer>
      <CustomerSearchContainer>
      <div className='search-inner'>
          <input type="text" placeholder="Search Customers" value={custResults} onChange={handleCustomerSearchChange} />
          <button onClick={()=> fetchCustomers(custResults)}>Search</button>
          {customers.length > 0 && (
            <div className='dropdown'>
              {customers.filter(results =>{                
                return custResults && (results[0].toLowerCase().includes(custResults.toLowerCase()) || results[1].toLowerCase().includes(custResults.toLowerCase())) && (results[0].toLowerCase() !== custResults.toLocaleLowerCase())

              }).map((result) => (
                <div onClick={()=>fetchCustomers(result[0])}  className='dropdown-item'>
                  {result[0]} - {result[1]}
                </div>          
))}
            </div>
          )}
        </div>

        </CustomerSearchContainer>
        
      <CustomerDisplayName>
        

        <h3 >Customer: </h3>
          {customerName}
      </CustomerDisplayName>
    

        {/* Popup for Anonymous customer */}
      {showPopup && (
        <div className="popup">
          <Popup onConfirm={handleAddCustomer} onCancel={handleCancelPopup} />
        </div>
      )}
    
      <Header>
        <Input
          type="text"
          placeholder="Enter barcode number"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          
        />
        <Button onClick={handleSearch}>Search</Button>
        
        <HoldNewInvoiceButton onClick={handleNewHoldInvoice}>
          Hold Invoices
        </HoldNewInvoiceButton>
        <CancelInvouceButton onClick={handelCancelInvoice}>
          Cancel Invoice
        </CancelInvouceButton>
      </Header>

      <Table>
        <thead>
          <tr>
          {invoiceType === 'hybrid' && <Th>Secondary</Th>}
            <Th>Name</Th>
            <Th>Price</Th>
            <Th>Quantity</Th>
            <Th>Discount</Th>
            <Th>Total</Th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            
            <tr key={product.id}>
                  {invoiceType === 'hybrid' && (
                  <Td>
                  <input
                    type="checkbox"
                    checked={selectedForSecondary.has(product.id)}
                    onChange={() => toggleProductSelection(product.id)}
                  />
                </Td>
                )}
              <Td>
                <EditableInput
                  type="text"
                  value={product.name}
                  onChange={(e) => handleEdit(product.id, 'name', e.target.value, invoiceId)}
                />
              </Td>
              <Td>
                <EditableInput
                  type="text"
                  value={product.price}
                  onChange={(e) => handleEdit(product.id, 'price', e.target.value, invoiceId)}
                />
              </Td>
              <Td>
                <EditableInput
                  type="number"
                  min="1"
                  value={product.quantity}
                  onChange={(e) => handleEdit(product.id, 'quantity', e.target.value, invoiceId)}
                />
              </Td>
              <Td>
                <EditableInput
                  type="number"
                  min="0"
                  value={product.discount}
                  onChange={(e) => handleEdit(product.id, 'discount', e.target.value, invoiceId)}
                />
              </Td>
              <Td>{((parseFloat(product.price)-parseFloat(product.discount)) * parseInt(product.quantity)).toFixed(2)}</Td>
              <Td>
                <DeleteButton onClick={() => handleDelete(product.id)}              
                  >===</DeleteButton>
              </Td>
            </tr>
          ))}
          <DiscountRow>
            <Td colSpan="3">Overall Discount</Td>
            <Td colSpan="2">
              <EditableInput
                type="number"
                min="0"
                max="100"
                value={overallDiscount}
                onChange={(e) => setOverallDiscount(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleOverallDiscount()}
              />
            </Td>
            <Td></Td>
          </DiscountRow>
          <TotalRow>
            <Td>
          <tr>  Total Amount </tr>
          <tr>Amount Settled</tr>
            </Td>
            <Td>
            <tr>{
              
              products.reduce((acc, product) => acc + (parseFloat(product.price)-parseFloat(product.discount)) * parseInt(product.quantity), 0).toFixed(2)
              // products.reduce((acc, product) => acc + (parseFloat(product.price) * parseInt(product.quantity)), 0).toFixed(2)
              }
              </tr>

                <tr>
                  {
                   settlement_amount.toFixed(2)

                  }
                </tr>
                </Td>
            <Td>
            <EditablePaymentEntries 
                  type="number"
                  min="0"
                  defaultValue="0"
                  value={products.upi}
                  onChange={(e) => handlePayment(products.id, 'upi', e.target.value, invoiceData.invoiceId)}
                />
                <span>UPI</span>
            </Td>
            <Td>
            <EditablePaymentEntries 
                  type="number"
                  min="0"
                  defaultValue="0"
                  value={products.cash}
                  onChange={(e) => handlePayment(products.id, 'cash', e.target.value, invoiceData.invoiceId)}
                />
                <span>CASH</span>
            </Td>
            <Td>
            <EditablePaymentEntries 
                  type="number"
                  min="0"
                  defaultValue="0"
                  value={products.cash}
                  onChange={(e) => handlePayment(products.id, 'credit', e.target.value, invoiceData.invoiceId)}
                />
                <span>CREDIT</span>
            </Td>

          </TotalRow>
        </tbody>
      </Table>
      <ButtonContainer>
        <SubmitButton onClick={handleSubmit}>Submit</SubmitButton>
      </ButtonContainer>
      <ButtonContainer>
        {/* <PrintButton
          customerName={customerName}
          products={products}
        /> */}
      </ButtonContainer>
    </Container>
    </>
  );
};

export default BarcodeSearch;
