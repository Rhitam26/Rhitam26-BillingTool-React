import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Plus,CheckSquare, Square } from 'lucide-react';
import styled from 'styled-components';
import { use } from 'react';
import axios from 'axios';
import { useEffect } from 'react';



const Container = styled(motion.div)`
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;
const DiscountInput = styled.input`
  width: 80px;
  margin-right: 8px;
`;

const InvoiceTypeSelector = styled.select`
  width: 100%;
  padding: 8px;
  margin-bottom: 16px;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  font-size: 14px;
`;

const HybridCheckbox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const DiscountTypeSelect = styled.select`
  padding: 8px;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  margin-left: 8px;
`;



const DropdownContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const Td = styled.td`
  border: 3px solid #ddd;
  padding: 8px;
  
`;

const DropdownItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  &:hover {
    background-color: #f9f9f9;
  }
`;

const AddNewSupplier = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  background-color: #f0faff;
  color: #007bff;
  &:hover {
    background-color: #e6f7ff;
  }
`;

const SupplierSearchInputWrapper = styled.div`
  position: relative;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #4A5568;
  margin-bottom: 8px;
`;
const BlurOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;
const SelectSupplierMessage = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  color: #4A5568;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: box-shadow 0.2s;

  &:focus {
    border-color: #4299E1;
    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.6);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #E2E8F0;
`;

const TableHead = styled.thead`
  background-color: #F7FAFC;
`;

const SelectedSupplierBanner = styled.div`
  background-color: #E6F7FF;
  color: #1A365D;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ClearSupplierButton = styled.button`
  background: none;
  border: none;
  color: #2C5282;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const TableCell = styled.th`
  border: 1px solid #E2E8F0;
  padding: 8px;
  text-align: left;
`;

const TableRow = styled.tr`
  &:hover {
    background-color: #F7FAFC;
  }
`;

const TableData = styled.td`
  border: 1px solid #E2E8F0;
  padding: 8px;
`;

const ActionButton = styled.button`
  padding: 4px;
  color: #E53E3E;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background-color: #FED7D7;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AddRowButton = styled.button`
  margin: 16px 0;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #3182CE;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;

  &:hover {
    background-color: #2B6CB0;
  }
`;

const SubmitButton = styled.button`
  padding: 8px 24px;
  background-color: #38A169;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;

  &:hover {
    background-color: #2F855A;
  }
`;

const DialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

const Dialog = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 384px;
`;

const DialogTitle = styled.h2`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
// `;


const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  gap: 8px;
`;

const CancelButton = styled.button`
  padding: 8px 16px;
  background: #EDF2F7;
  color: #4A5568;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #E2E8F0;
  }
`;

const SaveButton = styled.button`
  padding: 8px 16px;
  background: #3182CE;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;

  &:hover {
    background: #2B6CB0;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(145deg, #e6e6fa, #d8bfd8); /* Light violet gradient */
  padding: 30px 40px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2); /* Soft shadow for depth */
  z-index: 1000;
  font-family: 'Poppins', sans-serif; /* Trendy modern font */
  font-size: 20px;
  text-align: center; /* Center align text */
  
  /* Add smooth fade-in animation */
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translate(-50%, -48%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
  }

  h1, p {
    margin: 0 0 20px;
    color: #4a4a4a; /* Dark gray for contrast */
  }

  button {
    display: inline-block;
    margin: 10px 5px;
    padding: 10px 20px;
    background: linear-gradient(45deg, #f9d423, #ff4e50); /* Yellow to orange gradient */
    border: none;
    border-radius: 8px;
    color: white;
    font-family: 'Poppins', sans-serif;
    font-size: 16px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    }

    &:active {
      transform: scale(0.95);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
    }
  }
`;

const StyledForm = styled.div`
position: fixed;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
background: linear-gradient(145deg, #f0f4f8, #e6e6fa);
padding: 40px 50px;
border-radius: 20px;
box-shadow: 
  0 15px 35px rgba(0, 0, 0, 0.1), 
  0 5px 15px rgba(0, 0, 0, 0.05);
z-index: 1000;
font-family: 'Inter', 'Poppins', sans-serif;
max-width: 500px;
width: 90%;
text-align: center;
border: 1px solid rgba(255, 255, 255, 0.18);
backdrop-filter: blur(10px);
position: relative;

animation: elegantEnter 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;

@keyframes elegantEnter {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
`;

const CloseButton = styled.button`
position: absolute;
top: 15px;
right: 15px;
background: none;
border: none;
color: #4a5568;
font-size: 24px;
cursor: pointer;
transition: color 0.3s ease;

&:hover {
  color: #e53e3e;
}
`;

const FormSection = styled.div`
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;


const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const ItemPopContainer = styled.div`
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;



const TableWrapper = styled.div`
  position: relative;
  ${props => props.isDisabled && `
    pointer-events: none;
    user-select: none;
    opacity: 0.6;
  `}
`;

const DiscountRow = styled.tr`
  background-color: #f1f1f1;
  font-weight: bold;
`;

const BillingPurchaseTool = () => {
  const [currentDate] = useState(new Date().toLocaleDateString());
  const [purchaseItems, setPurchaseItems] = useState([
      { 
        supplierName: '',
        barcode_1: '', 
        barcode_2: '',
        category: '',
        type: '',
        company: '',
        itemName: '', 
        quantity: '', 
        purchasePrice: '', 
        defaultSalesPrice: '', 
        salesPrice1: '', 
        salesPrice2: '',
        salesPrice3: '',
        salesPrice4: '',
        salesPrice5: '',
        salesPrice6: '',
        itemDiscount: 0,
        discountType: 'percentage', // 'percentage' or 'flat',
        isSelected: false
      }
    ]); 
  const [newProduct, setNewProduct] = useState({
    name: '',
    barcode_1: '',
    barcode_2: '',
    category: '',
    type: '',
    company: '',
    purchasePrice: '',
    defaultSalesPrice: '',
    salesPrice1: '',
    salesPrice2: '',
    salesPrice3: '',
    salesPrice4: '',
    salesPrice5: '',
    salesPrice6: '',
    stock: ''
  });
  const [supName, setSupName] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierSuggestions, setSupplierSuggestions] = useState([]);
  const [isNewSupplierDialogOpen, setIsNewSupplierDialogOpen] = useState(false);
  const [newSupplierDetails, setNewSupplierDetails] = useState({
    name: '',
    phone: '',
    gst: '',
    address: ''
  });
  const [showProductForm, setShowProductForm] = useState(false);
  const [productNotFound, setProductNotFound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [flatDiscount, setFlatDiscount] = useState(0);
  const [extraCharges, setExtraCharges] = useState(0);
  const [grossTotal, setGrossTotal] = useState(null);
  const [dicountPercentage, setDiscountPercentage] = useState(null);
  const [inStockProducts, setInStockProducts] = useState([]);
  const wrapperRef = useRef();
  const [invoiceType, setInvoiceType] = useState('primary');
  const [formData, setFormData] = useState({
    name: '',
    primaryBarcode: '',
    secondaryBarcode: '',
    hasSecondaryBarcode: false,
    secondaryBarcodeStock: '',
    secondaryBarcodeWarehouse: '',
    purchasePrice: '',
    defaultSalesPrice: '',
    silverPrice: '',
    goldPrice: '',
    platinumPrice: '',
    diamondPrice: '',
    primaryWarehouse: '',
    hasKacchaVersion: false,
    kacchaFormData: {
      purchasePrice: '',
      defaultSalesPrice: '',
      silverPrice: '',
      goldPrice: '',
      platinumPrice: '',
      diamondPrice: '',
      warehouse: ''
    }}
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onClose = () => {
    setShowProductForm(false);
    setProductNotFound(false);
  };



const getSupName = async () => {
        try {
          const response = await axios.get(
            'https://sheets.googleapis.com/v4/spreadsheets/1YvUhfiX6oBVpl67x7gD4iiChZPis17aNgMVSSEHRak4/values/supplier!A:E?key=AIzaSyCCSlM3bNmnEd0CqUbX5C7znDyh2jKFQGU'
          );
          const rows = response.data.values;
          // console.log('rowsqwe:', rows);
          // set the options
          const suppliers = rows.slice(1).map(row => ({
            name: row[0],
            phone: row[1]
          }));
          
          setSupName(suppliers);  
        } catch (error) {
          // console.error('Error fetching data:', error);
        }
    }
    const handleClickOutside = (event) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
          setSupplierSuggestions([]); // Close the dropdown
        }
      };

      const handleKeyPress = (event) => {
        if (event.key === 'Escape') {
          setSupplierSuggestions([]); // Close the dropdown on `Esc`
        }
      };
    
      const handleSupplierSearch = (value) => {
        if (!value) {
          setSupplierSuggestions([]);
          return;
        }
    
        const filtered = supName.filter(supplier => 
          supplier.name.toLowerCase().includes(value.toLowerCase())
        );
    
        const suggestions = filtered.map(supplier => supplier.name);
        setSupplierSuggestions(suggestions);
      };

  const handleSaveNewSupplier = async () => {
    try {
      // Prepare the new supplier data to be added to the Google Sheet
      if (!newSupplierDetails.name || !newSupplierDetails.phone) {
        setSaveError('Name and Phone are required');
        return;
      }
      setIsSaving(true);
      setSaveError(null)
      const response = await axios.post('http://127.0.0.1:8000/create-supplier', {
        name: newSupplierDetails.name,
        phone: newSupplierDetails.phone,
        gst: newSupplierDetails.gst,
        address: newSupplierDetails.address
      });
      if (response.data) {
        // Add the new supplier to the local list
        setSupName([...supName, {
          name: newSupplierDetails.name,
          phone: newSupplierDetails.phone
        }]);
        setNewSupplierDetails({
          name: '',
          phone: '',
          gst: '',
          address: ''
        });
        setIsNewSupplierDialogOpen(false);

    } }catch (error) {
      console.error('Error saving new supplier:', error);
      setSaveError(error.response?.data?.message || 'Failed to save supplier');
    } finally {
      setIsSaving(false);
    }
  };


  const handleAddNewSupplier = () => {
    setIsNewSupplierDialogOpen(true);
  };

  const handleBarcodeSearch = async (barcode, index) => {
    // Fetch item details from the backend using the barcode
    try {
      const response = await axios.get(
        'https://sheets.googleapis.com/v4/spreadsheets/1YvUhfiX6oBVpl67x7gD4iiChZPis17aNgMVSSEHRak4/values/product!A:Z?key=AIzaSyCCSlM3bNmnEd0CqUbX5C7znDyh2jKFQGU'
      );
      const rows = response.data.values;
      console.log('rows:', rows);
      if (inStockProducts.length === 0){
        console.log('Fetching Products...');
        setInStockProducts(rows);
    }
    
      // set the options
      const foundItem = rows.find(row => row[1] === barcode || row[2] === barcode);
      if (foundItem) {
        console.log('Found Item:', foundItem);
        // update the item in the purchase items list
        const updatedItems = [...purchaseItems];
        updatedItems[index] = {
          ...updatedItems[index],
          itemName: foundItem[2],
          purchasePrice: foundItem[3],
          defaultSalesPrice: foundItem[4],
          salesPrice1: foundItem[5],
          salesPrice2: foundItem[6]
        };
        setPurchaseItems(updatedItems);

      }
      else{
        console.log('Item not found');
        setProductNotFound(true);
      }

  } catch (error) {
    console.error('Error fetching data:', error);
  }
  };


   const handleSupplierSelect = (supplierName) => {
    const fullSupplier = supName.find(s => s.name === supplierName) || null;
    setSelectedSupplier(fullSupplier);
    
    const updatedItems = purchaseItems.map(item => ({
      ...item,
      supplierName: fullSupplier.name
    }));
    
    setPurchaseItems(updatedItems);
    setSupplierSuggestions([]);
  };

  const clearSelectedSupplier = () => {
    setSelectedSupplier(null);
    
    // Reset supplier name in purchase items
    const updatedItems = purchaseItems.map(item => ({
      ...item,
      supplierName: ''
    }));
    
    setPurchaseItems(updatedItems);
  };

  const handleYesClick = () => {
    setProductNotFound(false);
    setShowProductForm(true);
  };

  const calculateItemTotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.purchasePrice) || 0;

    // check if discount is percentage or flat
    const discount = item.discountType === 'percentage' ?
      (price * parseFloat(item.itemDiscount) / 100) : parseFloat(item.itemDiscount) || 0;
    console.log('Discount:', discount);
    console.log('Discount Type:', item.discountType);
    // console.log((quantity * price) - discount)
    // return (quantity * price) - discount;
    console.log((price- discount) * quantity)
    return (price- discount) * quantity;
  };

  // Helper function to calculate base total from purchase items
  const calculateBaseTotal = () => {
    return purchaseItems.reduce((acc, item) => {
      return acc + calculateItemTotal(item);
    }, 0);
  };
const handleProductFormSubmit = async (e) => {
  e.preventDefault();
  try {
    await axios.post('/api/products', newProduct);
    alert('Product created successfully!');
    setShowProductForm(false);
    setProductNotFound(false);
  } catch (error) {
    console.error('Error creating product:', error);
  }
};
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...purchaseItems];
    if (field === 'isSelected' && invoiceType === 'hybrid') {
      updatedItems[index].isSelected = value;
    } else {
      updatedItems[index][field] = value;
    }
    
    setPurchaseItems(updatedItems);
    
   

    // calculate item total when quantity or price changes or discount changes

    if (field === 'quantity' || field === 'purchasePrice' || field === 'itemDiscount' || field === 'discountType') {
      const baseTotal = calculateBaseTotal();
      console.log('Base Total:', baseTotal);
      const discountAmount = flatDiscount ? parseFloat(flatDiscount) : 
      (dicountPercentage ? (baseTotal * parseFloat(dicountPercentage) / 100) : 0);
      const newTotal = baseTotal - discountAmount + (parseFloat(extraCharges) || 0);
      setGrossTotal(newTotal);
    }

  };

  const addNewItemRow = () => {
    setPurchaseItems([
      ...purchaseItems, 
      { supplierName: '', itemName: '', quantity: '', purchasePrice: '', defaultSalesPrice: '', salesPrice1: '', salesPrice2: '' }
    ]);
  };

  const removeItemRow = (index) => {
    if (purchaseItems.length > 1) {
      const updatedItems = purchaseItems.filter((_, i) => i !== index);
      setPurchaseItems(updatedItems);
    }
    // calculate new total when an item is removed
    const baseTotal = calculateBaseTotal();
    const discountAmount = flatDiscount ? parseFloat(flatDiscount) : 
      (dicountPercentage ? (baseTotal * parseFloat(dicountPercentage) / 100) : 0);
    const newTotal = baseTotal - discountAmount + (parseFloat(extraCharges) || 0);
    setGrossTotal(newTotal);

  };

 


  const toggleCheckbox = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChange = (e, section = null) => {
    const { name, value } = e.target;
    
    if (section === 'kaccha') {
      setFormData(prev => ({
        ...prev,
        kacchaFormData: {
          ...prev.kacchaFormData,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = () => {
    if (invoiceType === 'primary') {
      // Submit all items as primary invoice
      submitPrimaryInvoice(purchaseItems);
    } else if (invoiceType === 'kaccha') {
      // Submit all items as kaccha invoice
      submitKacchaInvoice(purchaseItems);
    } else if (invoiceType === 'hybrid') {
      // Separate items into primary and kaccha
      const primaryItems = purchaseItems.filter(item => !item.isSelected);
      const kacchaItems = purchaseItems.filter(item => item.isSelected);
      
      submitPrimaryInvoice(primaryItems);
      submitKacchaInvoice(kacchaItems);
    }
  };


  const submitPrimaryInvoice = (items) => {
    console.log('Submitting Primary Invoice:', items);
    // Implement primary invoice submission logic
  };

  const submitKacchaInvoice = (items) => {
    console.log('Submitting Kaccha Invoice:', items);
    // Implement kaccha invoice submission logic
  };



// Update these state handlers
const handleDiscountPercentage = (e) => {
  const value = parseFloat(e.target.value) || '';
  setDiscountPercentage(value);
  
  // Calculate new total with percentage discount
  const baseTotal = calculateBaseTotal();
  const discountAmount = (baseTotal * value) / 100;
  const newTotal = baseTotal - discountAmount + (parseFloat(extraCharges) || 0);
  setGrossTotal(newTotal);
};

const handleFlatDiscount = (e) => {
  const value = parseFloat(e.target.value) || '';
  setFlatDiscount(value);
  
  // Calculate new total with flat discount
  const baseTotal = calculateBaseTotal();
  const newTotal = baseTotal - value + (parseFloat(extraCharges) || 0);
  setGrossTotal(newTotal);
};

  const handleExtraCharges = (e) => {
    // setExtraCharges(e.target.value);

    const value = parseFloat(e.target.value) || '';
  setExtraCharges(value);
  // Calculate new total with flat discount
  const baseTotal = calculateBaseTotal();
  console.log("baseTotal ",baseTotal);
  console.log("extraCharges ",value);
  const newTotal = parseFloat(baseTotal) + parseFloat(value);
  setGrossTotal(newTotal);
    
  };

  
  useEffect(() => {
    console.log('Purchase Items:', purchaseItems);
    if (supName.length === 0){
        console.log('Fetching Suppliers...');
        getSupName();
    }
    

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyPress);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyPress);
        };
  },[purchaseItems]);

  return (
    <Container ref = {wrapperRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >

<InvoiceTypeSelector 
        value={invoiceType}
        onChange={(e) => {
          setInvoiceType(e.target.value);
          // Reset items when changing invoice type
          setPurchaseItems([{ 
            supplierName: '',
            itemName: '', 
            quantity: '', 
            purchasePrice: '', 
            defaultSalesPrice: '', 
            salesPrice1: '', 
            salesPrice2: '',
            itemDiscount: 0,
            discountType: 'percentage',
            isSelected: false
          }]);
        }}
      >
        <option value="primary">Primary Invoice</option>
        <option value="kaccha">Kaccha Invoice</option>
        <option value="hybrid">Hybrid Invoice</option>
      </InvoiceTypeSelector>


      <Title>Purchase Invoice</Title>  
      {selectedSupplier && (
        <SelectedSupplierBanner>
          <span>{selectedSupplier.name}</span>
          <ClearSupplierButton onClick={clearSelectedSupplier}>
            Clear
          </ClearSupplierButton>
        </SelectedSupplierBanner>
      )} 
      
      <div>
        {/* <Label>Barcode Number</Label> */}
<SupplierSearchInputWrapper>
  <input
    type="text"
    onChange={(e) => handleSupplierSearch(e.target.value)}
    placeholder="Search Supplier"
    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  {supplierSuggestions.length > 0 && (
    
    <DropdownContainer>
      {supplierSuggestions.map((supplier, i) => (
        <DropdownItem
          key={i}
          onClick={() => handleSupplierSelect(supplier)}
        >
          {supplier}
        </DropdownItem>
      ))}

    </DropdownContainer>
    
  )}
    <AddNewSupplier onClick={handleAddNewSupplier}>
        + Add New Supplier
      </AddNewSupplier>
</SupplierSearchInputWrapper>

      </div>
      <TableWrapper isDisabled={!selectedSupplier}>
      <Table>
        <TableHead>
          <tr>
          {invoiceType === 'hybrid' && (
                <TableCell>Select</TableCell>
              )}
            <TableCell>Date</TableCell>
            <TableCell>Barcode Number</TableCell>
            <TableCell>Item Name</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Purchase Price</TableCell>
            <TableCell>Default Sales Price</TableCell>
            <TableCell>Sales Price 1</TableCell>
            <TableCell>Sales Price 2</TableCell>
            <TableCell>Actions</TableCell>
          </tr>
        </TableHead>
        <tbody>
          {purchaseItems.map((item, index) => (
            <TableRow key={index}>
                  {invoiceType === 'hybrid' && (
                  <TableData>
                    <HybridCheckbox 
                      onClick={() => handleItemChange(index, 'isSelected', !item.isSelected)}
                    >
                      {item.isSelected ? <CheckSquare /> : <Square />}
                    </HybridCheckbox>
                  </TableData>
                )}
              <TableData>{currentDate}</TableData>
              <TableData>
                     <Input 
          type="text"
          value={item.barcode}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleBarcodeSearch(item.barcode, index);
            }

          }}
          onChange={(e) => handleItemChange(index, 'barcode', e.target.value)}

          placeholder="Barcode Number"

        />
          {productNotFound && (
        <>
          <Overlay onClick={() => setProductNotFound(false)} />
          <Modal>
            <p>Product not found. Do you want to create a new product?</p>
            <button onClick={handleYesClick}>Yes</button>
            <button onClick={() => setProductNotFound(false)}>No</button>
          </Modal>
        </>
      )}
            {showProductForm && (
        
     
<StyledForm onSubmit={handleSubmit}>
<h2>Create New Product</h2>
<CloseButton onClick={onClose}>×</CloseButton>
<input
  type="text"
  name="name"
  value={formData.name}
  onChange={handleChange}
  placeholder="Product Name"
  required
/>

<input
  type="text"
  name="primaryBarcode"
  value={formData.primaryBarcode}
  onChange={handleChange}
  placeholder="Primary Barcode Number"
  required
/>

<CheckboxWrapper onClick={() => toggleCheckbox('hasSecondaryBarcode')}>
  {formData.hasSecondaryBarcode ? <CheckSquare /> : <Square />}
  <span>Has Secondary Barcode?</span>
</CheckboxWrapper>

{formData.hasSecondaryBarcode && (
  <FormSection>
    <input
      type="text"
      name="secondaryBarcode"
      value={formData.secondaryBarcode}
      onChange={handleChange}
      placeholder="Secondary Barcode Number"
    />
    <input
      type="number"
      name="secondaryBarcodeStock"
      value={formData.secondaryBarcodeStock}
      onChange={handleChange}
      placeholder="Secondary Barcode Stock"
    />
    <select
      name="secondaryBarcodeWarehouse"
      value={formData.secondaryBarcodeWarehouse}
      onChange={handleChange}
      placeholder="Warehouse"
    >
      <option value="">Select Warehouse</option>
      <option value="W1">W1</option>
      <option value="W2">W2</option>
      <option value="shop">Shop</option>
    </select>
  </FormSection>
)}

<FormSection>
  <h3>Primary Product Details</h3>
  <input
    type="number"
    name="purchasePrice"
    value={formData.purchasePrice}
    onChange={handleChange}
    placeholder="Purchase Price"
    required
  />
  <input
    type="number"
    name="defaultSalesPrice"
    value={formData.defaultSalesPrice}
    onChange={handleChange}
    placeholder="Default Sales Price"
    required
  />
  <input
    type="number"
    name="silverPrice"
    value={formData.silverPrice}
    onChange={handleChange}
    placeholder="Silver Price"
  />
  <input
    type="number"
    name="goldPrice"
    value={formData.goldPrice}
    onChange={handleChange}
    placeholder="Gold Price"
  />
  <input
    type="number"
    name="platinumPrice"
    value={formData.platinumPrice}
    onChange={handleChange}
    placeholder="Platinum Price"
  />
  <input
    type="number"
    name="diamondPrice"
    value={formData.diamondPrice}
    onChange={handleChange}
    placeholder="Diamond Price"
  />
  <select
    name="primaryWarehouse"
    value={formData.primaryWarehouse}
    onChange={handleChange}
    required
  >
    <option value="">Select Warehouse</option>
    <option value="W1">W1</option>
    <option value="W2">W2</option>
    <option value="shop">Shop</option>
  </select>
</FormSection>

<CheckboxWrapper onClick={() => toggleCheckbox('hasKacchaVersion')}>
  {formData.hasKacchaVersion ? <CheckSquare /> : <Square />}
  <span>Create Kaccha Version?</span>
</CheckboxWrapper>

{formData.hasKacchaVersion && (
  <FormSection>
    <h3>Kaccha Product Details</h3>
    <input
      type="number"
      name="purchasePrice"
      value={formData.kacchaFormData.purchasePrice}
      onChange={(e) => handleChange(e, 'kaccha')}
      placeholder="Kaccha Purchase Price"
    />
    <input
      type="number"
      name="defaultSalesPrice"
      value={formData.kacchaFormData.defaultSalesPrice}
      onChange={(e) => handleChange(e, 'kaccha')}
      placeholder="Kaccha Default Sales Price"
    />
    <input
      type="number"
      name="silverPrice"
      value={formData.kacchaFormData.silverPrice}
      onChange={(e) => handleChange(e, 'kaccha')}
      placeholder="Kaccha Silver Price"
    />
    <input
      type="number"
      name="goldPrice"
      value={formData.kacchaFormData.goldPrice}
      onChange={(e) => handleChange(e, 'kaccha')}
      placeholder="Kaccha Gold Price"
    />
    <input
      type="number"
      name="platinumPrice"
      value={formData.kacchaFormData.platinumPrice}
      onChange={(e) => handleChange(e, 'kaccha')}
      placeholder="Kaccha Platinum Price"
    />
    <input
      type="number"
      name="diamondPrice"
      value={formData.kacchaFormData.diamondPrice}
      onChange={(e) => handleChange(e, 'kaccha')}
      placeholder="Kaccha Diamond Price"
    />
    <select
      name="warehouse"
      value={formData.kacchaFormData.warehouse}
      onChange={(e) => handleChange(e, 'kaccha')}
    >
      <option value="">Select Warehouse</option>
      <option value="W1">W1</option>
      <option value="W2">W2</option>
      <option value="shop">Shop</option>
    </select>
  </FormSection>
)}

<button type="submit">Create Product</button>
</StyledForm>
      
      )}
              </TableData>
              <TableData>
                <Input 
                  type="text"
                  value={item.itemName}
                  onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                  placeholder="Item Name"
                />
              </TableData>
              <TableData>
                <Input 
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  placeholder="Quantity"
                />
              </TableData>
              <TableData>
                <Input 
                  type="number"
                  value={item.purchasePrice}
                  onChange={(e) => handleItemChange(index, 'purchasePrice', e.target.value)}
                  placeholder="Purchase Price"
                />
              </TableData>
              <TableData>
                <Input 
                  type="number"
                  value={item.defaultSalesPrice}
                  onChange={(e) => handleItemChange(index, 'defaultSalesPrice', e.target.value)}
                  placeholder="Default Sales Price"
                />
              </TableData>
              <TableData>
                <Input 
                  type="number"
                  value={item.salesPrice1}
                  onChange={(e) => handleItemChange(index, 'salesPrice1', e.target.value)}
                  placeholder="Sales Price 1"
                />
              </TableData>
              <TableData>
                <Input 
                  type="number"
                  value={item.salesPrice2}
                  onChange={(e) => handleItemChange(index, 'salesPrice2', e.target.value)}
                  placeholder="Sales Price 2"
                />
                              </TableData>
              <TableData>
              <DiscountInput 
                type="number"
                value={item.itemDiscount}
                onChange={(e) => handleItemChange(index, 'itemDiscount', e.target.value)}
                placeholder="Discount"
              />
              <DiscountTypeSelect
                value={item.discountType}
                onChange={(e) => handleItemChange(index, 'discountType', e.target.value)}
              >
                <option value="percentage">%</option>
                <option value="flat">₹</option>
              </DiscountTypeSelect>
              </TableData>
              <TableData>
                <ActionButton 
                  onClick={() => removeItemRow(index)}
                  disabled={purchaseItems.length <= 1}
                >
                  <X />
                </ActionButton>
              </TableData>
            </TableRow>
          ))}
        </tbody>
      </Table>
      {!selectedSupplier && (
          <BlurOverlay>
            <SelectSupplierMessage>
              Please select a supplier before adding items
            </SelectSupplierMessage>
          </BlurOverlay>
        )}
          <AddRowButton onClick={addNewItemRow}>
        <Plus /> Add Item
      </AddRowButton>
      <DiscountRow>
        <Td colSpan="4">PERCENTAGE Discount</Td>
        <Td colSpan="4">
          <Input
            type="number"
            value={dicountPercentage}
            onChange={handleDiscountPercentage}
            placeholder="Discount Percentage"
          />
        </Td>
      </DiscountRow>
      <DiscountRow>
        <Td colSpan="4">FLAT Discount</Td>
        <Td colSpan="4">
          <Input
            type="number"
            value={flatDiscount}
            onChange={handleFlatDiscount}
            placeholder="Flat Discount"
          />
        </Td>
      </DiscountRow>
      <DiscountRow>
        <Td colSpan="4">EXTRA Charges</Td>
        <Td colSpan="4">
          <Input
            type="number"
            value={extraCharges}
            onChange={handleExtraCharges}
            placeholder="Charges"
          />
        </Td>
      </DiscountRow>
      <tr>  Total Amount </tr>
      <tr>
        {
          grossTotal
        }
      </tr>

        </TableWrapper>
  
      <div style={{ textAlign: 'right' }}>
        <SubmitButton onClick={handleSubmit}>Create Invoice</SubmitButton>
      </div>

      {isNewSupplierDialogOpen && (
        <DialogOverlay>
          <Dialog>
            <DialogTitle>Add New Supplier</DialogTitle>
            <div>
              <Label>Name</Label>
              <Input 
                type="text"
                value={newSupplierDetails.name}
                onChange={(e) => setNewSupplierDetails({...newSupplierDetails, name: e.target.value})}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input 
                type="text"
                value={newSupplierDetails.phone}
                onChange={(e) => setNewSupplierDetails({...newSupplierDetails, phone: e.target.value})}
              />
            </div>
            <div>
              <Label>GST Number</Label>
              <Input 
                type="text"
                value={newSupplierDetails.gst}
                onChange={(e) => setNewSupplierDetails({...newSupplierDetails, gst: e.target.value})}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input 
                type="text"
                value={newSupplierDetails.address}
                onChange={(e) => setNewSupplierDetails({...newSupplierDetails, address: e.target.value})}
              />
            </div>

            <DialogActions>
              <CancelButton onClick={() => setIsNewSupplierDialogOpen(false)}>Cancel</CancelButton>
              <SaveButton onClick={handleSaveNewSupplier}>Save Supplier</SaveButton>
            </DialogActions>
          </Dialog>
        </DialogOverlay>
      )}
    </Container>
  );
};



export default BillingPurchaseTool;
