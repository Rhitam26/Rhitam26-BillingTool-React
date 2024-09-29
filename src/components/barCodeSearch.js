import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import ProdSearchableDropdown from './prodSearch';
import Popup from './popUp';
// import Select from 'react-select';
import'./styles.css';




// Styled components for layout and styling
const Container = styled.div`
  width: 80%;
  margin: 0 auto;
  margin-top: 50px;
  position: relative;
`;

const Select = styled.select`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 100%;
`;


const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 10px;
  margin-right: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 200px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  background-color: #28a745;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
`;

const SubmitButton = styled(Button)`
  background-color: #007bff;
`;

const HoldNewInvoiceButton = styled(Button)`
  background-color: #ffc107;
`;



const Table = styled.table`
  background-color: ${(props) => props.theme ? 'white' : 'yellow'};
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
  background-color: #f2f2f2;
`;

const Td = styled.td`
  border: 1px solid #ddd;
  padding: 8px;
`;

const EditableInput = styled.input`
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 100%;
`;

const EditablePaymentEntries = styled.input`
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 30%;
`;


const DeleteButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TotalRow = styled.tr`
  background-color: #f9f9f9;
  font-weight: bold;
`;

const Dropdown = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  width: 3000px;
  z-index: 1000;
  display: flex;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex-direction: column;
  max-height: 200px;
  list-style: none;
  padding: 0;
  margin: 0;

`;
const SearchContainer = styled.div`
  position: fixed;
  top: 50px;
  left: 10px;
  width: 3000px; /* Adjust the width as needed */
  z-index: 1000; /* Ensure it stays on top of other elements */
  display: flex;
  flex-direction: column;
  align-items: left;
  border: 1px solid 
  edge-radius: 12px;
`;

const CustomerSearchContainer = styled.div`
  position: fixed;
  top: 50px;
  left: 1200px;
  width: 3000px; /* Adjust the width as needed */
  z-index: 1000; /* Ensure it stays on top of other elements */
  display: flex;
  flex-direction: column;
  align-items: left;
  border: 1px solid
  edge-radius: 12px;
`;


const CustomerContainer = styled.div`
  position: fixed;
  top: 50px;
  left: 820px;

`;

const DiscountRow = styled.tr`
  background-color: #f1f1f1;
  font-weight: bold;
`;


const ProductSelecet = styled.select`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 100%;
`;

const HoldInvoicesButton = styled(Button)`
  background-color: #ffc107;
  margin-top: 100px;
`;

const CancelInvouceButton = styled(Button)`
  background-color: #dc3545;
`;


const ReceiptButton = styled(Button)`
  background-color: #28a745;
`;

const ReOrderManagemntButton = styled(Button)`
  background-color: #007bff;
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
  const [balance, setBalance] = useState(totalPrice);
  let cash_payment = 0;
  let [submissionType, setSubmissionType] = useState('Fresh');
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  // get current unix timestamp
  console.log("PRODUCTS", products);
  totalPrice = parseFloat(products.reduce((acc, product) => acc + (parseFloat(product.price)-parseFloat(product.discount)) * parseInt(product.quantity), 0).toFixed(2));
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


  const emptyProductRow ={
    id : '',
    name : '',
    price : '',
    quantity : '',
    discount : ''
  }

  const handleNewHoldInvoice =async () => {
    console.log('Hold Invoice');
    console.log('products:', products);
    // generate the invoice number
    invoiceId = Date.now();

    if (customerName.startsWith('Anonymous#')) {
      setShowPopup(true);
      return;
    }


    const url ='http://127.0.0.1:5000/hold_invoice'
    try {
      const response = await axios.post(url, {
        values: products,
        customerName: customerName,
        invoice_id: String(invoiceId),
      });

      alert('Invoice ID: ' + invoiceId + ' held successfully and is in HOLD state');


      console.log('response:', response);
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

    } catch (error) {
      console.error('Error submitting data:', error);
      if (submissionType === 'Hold'){
        alert("THIS IS A HOLD INVOICE, PLEASE SUBMIT THE INVOICE TO SAVE IT");
        console.log(error);
      }
      alert('Error submitting data:', error);
    }
    

  };

  const handelCancelInvoice = () => {
    console.log('Cancel Invoice');
  // clear the products array
  setProducts([]);
  setTotalPrice(0);
  setOverallDiscount(0);
  setBarcode('');
  sessionStorage.removeItem('invoiceData');
  };

  
  const handleSubmit = async () => {

    const formattedProducts = products.map((product) => [product.name, product.price, product.quantity]);
    console.log('formattedProducts:', formattedProducts);

    if (settlement_amount !== 0){
      alert('Please settle the amount before submission');
      return;
    }
  

    const url ='http://127.0.0.1:5000/webhook'
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
        values: formattedProducts,
        invoice_id: invoiceId,
        Submission_Type :submissionType
      });
      
      if (creditPayment > 0){
        console.log('Adding details to credits sheet..', creditPayment);
        const url ="http://127.0.0.1:5000/add_credit"
        const response = await axios.post(url, {
          customerName: customerName,
          creditAmount: creditPayment,
        });
      }
        console.log('response:', response);


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
    location.state.invoiceData = null;
    console.log('location .... :', location);

    // remove the data from the table
    setProducts([]);
    setTotalPrice(0);
    setOverallDiscount(0);
    setBarcode('');
    // Reload the page to create a new session
    }
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Error submitting data:', error);
    }
    if (submissionType === 'Hold'){
      // remove the invoice from the sheet
      console.log('Deleting invoice...:', invoiceId);
      
      try{
        console.log('Trying Deleting invoice...:', invoiceId);
        const response = await axios.post('http://127.0.0.1:5000/chnage_held_invocies', {
          invoiceId:invoiceId ,
          values: formattedProducts
        });
      console.log('response:', response); 
        
    }
    catch (error) {
      console.error('Error deleting invoice:', error);
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
      console.log('Fetching customers...');
      getCustomers();
    }

    if (options.length === 0){
      console.log('Fetching options...');
      getOptions();

    }

    if (location.state && location.state.invoiceData && location.state.invoiceData.data.products) {
      // check if the user has pressed refresh
      
      const { invoiceData } = location.state;
      console.log('invoiceData...:', invoiceData.data.products);
      console.log(products)
      invoiceId = invoiceData.invoiceId;
      // setInvoiceId(invoiceId);
     

      const newProducts = invoiceData.data.products.map((product) => ({
        id : product.id,
        name : product.name,
        price : product.price,
        quantity : product.quantity,
        discount : product.discount,
        upi : product.upi,
        cash : product.cash,
        credit : product.credit
      }));
      console.log('newProducts:', newProducts);
      console.log(invoiceData.data.customer_name);
      setCustomerName(invoiceData.data.customer_name);
      console.log('customerName....:', customerName);
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
    navigate('/add-user'); // Redirect to add user form
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
    console.log('overallDiscount:', overallDiscount);
    totalPrice = totalPrice - overallDiscount;
    setTotalPrice(totalPrice);
  }

  
const handleSearchChange = (e) => {
    const query = e.target.value;
    console.log('query:', query);
    setValues(query);

  }

  const handleCustomerSearchChange = (e) => {
    const query = e.target.value;
    console.log('cust query :', query);
    setCustResults(query);
  }

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        'https://sheets.googleapis.com/v4/spreadsheets/1YvUhfiX6oBVpl67x7gD4iiChZPis17aNgMVSSEHRak4/values/Sheet1!A:C?key=AIzaSyCCSlM3bNmnEd0CqUbX5C7znDyh2jKFQGU'
      );

      const rows = response.data.values;
      const foundProduct = rows.find((row) => row[0] === barcode);

      if (foundProduct) {
        
        setProducts((prevProducts) => [
          ...prevProducts,
          {
            name: foundProduct[2],
            id : foundProduct[0],
            price: foundProduct[1],
            quantity: 1,
            discount: 0,
          },
          
        ]);
        setBarcode(''); // Clear input after search
        // Calculate the total price

        for (let i = 0; i < products.length; i++) {
          totalPrice += (parseFloat(products[i].price)- parseFloat(products[i].discount)) * parseInt(products[i].quantity);
        }
        setTotalPrice(totalPrice);
        console.log('SearchtotalPrice:', totalPrice);
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
    console.log('id:', id);

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
      console.log("PROduct Total ", parseFloat(products[i].price)- parseFloat(products[i].discount) * parseInt(products[i].quantity))
    }
    console.log('price_till_now:', price_till_now);
  };

  const handlePayment = (invoice_id, key, value) => {
    console.log('id:', invoice_id);
    console.log("((((((((( products ))))))))", products);
    console.log('key:', key);
    console.log('value:', value);
    console.log("Total Price", totalPrice);
    console.log("UPI Payment", upiPayment);
    console.log("Cash Payment", cashPayment);
    console.log("Settlement Amount", settlement_amount);
    // balance = settlement_amount
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
      console.log('rowsqwe:', rows);
      // set the options
      options = rows;
      setOptions(options);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    

  };


  const getCustomers = async () => {
    try{
      const response = await axios.get(
        'https://sheets.googleapis.com/v4/spreadsheets/1YvUhfiX6oBVpl67x7gD4iiChZPis17aNgMVSSEHRak4/values/Sheet6!A:C?key=AIzaSyCCSlM3bNmnEd0CqUbX5C7znDyh2jKFQGU'
      );
      const rows = response.data.values;
      console.log('rows:', rows);
      // set the customers
      customers = rows;
      setCustomers(customers);
      

    }
    catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchProducts = async (e) => {
    console.log('selectedOption:', e);
    setValues(e);
    console.log("Search:", searchTerm);
   
  }

  const fetchCustomers = async (e) => {
    console.log('selectedOption:', e);
    setCustResults(e);
    console.log("Search:", searchTerm);
    let temp_customerName = customers.find((customer) => customer[0] === e);
    console.log('temp_customerName:', temp_customerName);
    setCustomerName(temp_customerName[0]);

  }

  return (

    <Container>
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
        
      <CustomerContainer>
          {customerName}
      </CustomerContainer>
      
      <HoldInvoicesButton onClick={handleHoldInvoicesClick}>
          Old Held Invoices
        </HoldInvoicesButton>

        {/* Popup for Anonymous customer */}
      {showPopup && (
        <div className="popup">
          <Popup onConfirm={handleAddCustomer} onCancel={handleCancelPopup} />
        </div>
      )}
    
        <ReceiptButton onClick={handleRecievePayments}>
          Receipt\Received Payments
        </ReceiptButton>
        <ReOrderManagemntButton onClick={handleReOrderManagement}>
          Re-Order Management
        </ReOrderManagemntButton>
      <Header>
        <Input
          type="text"
          placeholder="Enter barcode number"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          
        />
        <Button onClick={handleSearch}>Search</Button>
        <SubmitButton onClick={handleSubmit}>Submit</SubmitButton>
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
          <tr>
            <Td colSpan="5">Transaction Type</Td>
            <Td>
              <Select value={transactionType} onChange={handleTransactionTypeChange}>
                <option value="Cash">Cash</option>
                <option value="Credit">Credit</option>
              </Select>
            </Td>
          </tr>
          {transactionType === 'Cash' && (
            <tr>
              <Td colSpan="5">Payment Option</Td>
              <Td>
                <Select value={paymentOption} onChange={handlePaymentOptionChange}>
                  <option value="Multiple Payment">Multiple Payment</option>
                  <option value="Card">Card</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>

                </Select>
              </Td>
            </tr>
          )}
          {transactionType === 'Credit' && (
            <tr>
              <Td colSpan="5">Payment Option</Td>
              <Td>
                <Select value={paymentOption} onChange={handlePaymentOptionChange}>
                  <option value="Partial">Partial</option>
                  <option value="Full">Full</option>
                </Select>
              </Td>
            </tr>
          )}
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
    </Container>
  );
};

export default BarcodeSearch;
