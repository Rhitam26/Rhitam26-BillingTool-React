import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

// Styled components for layout and styling
const Container = styled.div`
  width: 80%;
  margin: 0 auto;
  margin-top: 50px;
`;

const Table = styled.table`
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

const EditablePaymentEntries = styled.input`
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 30%;
`;

const Select = styled.select`
  padding: 5px;
`;

const Input = styled.input`
  padding: 5px;
  width: 100px;
  ${(props) => props.disabled && `
    background-color: #f2f2f2;
    cursor: not-allowed;
  `}
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const CustomerCreditSettlement = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('https://sheets.googleapis.com/v4/spreadsheets/1YvUhfiX6oBVpl67x7gD4iiChZPis17aNgMVSSEHRak4/values/Sheet5!A:C?key=AIzaSyCCSlM3bNmnEd0CqUbX5C7znDyh2jKFQGU');
        const data = response.data.values
        console.log(data);
        // ignore the first row of the sheet
        data.shift();
        // Parse the JSON data stored in the second column
        // add two more values to the array for upi and cash
        for (let i = 0; i < data.length; i++) {
          data[i].push(0);
          data[i].push(0);
        }
        setCustomers(data);
        console.log(customers);
      } catch (error) {
        console.error('Error fetching customer data:', error);
      }
    };

    fetchCustomers();

  }, []);


  const handleSettlement = (customer) => {

    console.log("HELLO");
    console.log(customer);
    // update the credit amount of the customer
    customer[1] = parseFloat(customer[1])-(parseFloat(customer[2])+parseFloat(customer[3]));
    customer[2] = 0;
    customer[3] = 0;
    // update customers state
    setCustomers([...customers]);
    console.log("CUSTOMER :",customer);
    // update the Google Sheet
    updateGoogleSheet(customer);
    
  };

const handlePayment =(customer,type,value )=>{
  console.log("TYPE :", type);
  if (type === 'upi') {
    // assign the upi value to the customer object
    customer[2]= value;
  }
  else if (type === 'cash') {
    // assign the cash value to the customer object
    customer[3] = value;
  }
  console.log("CUSTOMER :",customer);
  setCustomers([...customers]);

}

  const updateGoogleSheet = async (customer) => {
    try {
      // Implement the logic to update Google Sheet here
      // await axios.post('YOUR_GOOGLE_SHEET_UPDATE_API_URL', {
      //   customer,
      // });
      console.log(customer[0]);
      console.log(customer[1]);

      await axios.post('http://127.0.0.1:5000/recieved_payement', {
        customerName: customer[0],
        updatedCreditAmount: customer[1],
      });
    } catch (error) {
      console.error('Error updating Google Sheets:', error);
    }
    window.location.reload();
  };

  return (
    <Container>
      <h1>Customer Credit Settlement</h1>
      <Table>
        <thead>
          <tr>
            <Th>Customer Name</Th>
            <Th>Credit Amount</Th>
            <Th>UPI</Th>
            <Th>Cash</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer, index) => (
            <tr key={index}>
              <Td>{customer[0]}</Td>
              <Td>{parseFloat(customer[1])-(parseFloat(customer[2])+parseFloat(customer[3]))}</Td>
              <Td>
                <EditablePaymentEntries
                  type="number"
                  min="0"
                  defaultValue="0"
                  // value={customer.upi}
                  onChange={(e) => handlePayment(customer,"upi",e.target.value)}
                />
              </Td>
              <Td>
              <EditablePaymentEntries
                  type="number"
                  min="0"
                  defaultValue="0"
                  // value={customer.upi}
                  onChange={(e) => handlePayment(customer,"cash",e.target.value)}
                />
              </Td>
              <Td>
                <Button onClick={() => handleSettlement(customer)}>Settle</Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default CustomerCreditSettlement;
