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
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customer data:', error);
      }
    };

    fetchCustomers();
  }, []);


  const handleSettlement = (index) => {
    const updatedCustomers = [...customers];
    const customer = updatedCustomers[index];
    console.log(customer.partialAmount);
    
    if (customer.paymentMode === 'Partial') {
      customer[1] -= parseFloat(customer.partialAmount || 0);
    } else {
      customer[1] = 0;
    }
    console.log(customer[1]);

    // Update the Google Sheet
    updateGoogleSheet(customer);

    if (customer.creditAmount <= 0) {
      updatedCustomers.splice(index, 1);
    }

    setCustomers(updatedCustomers);

    // Refresh the page
    
  };

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
            <Th>Settlement Mode</Th>
            <Th>Full/Partial</Th>
            <Th>Partial Amount</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer, index) => (
            <tr key={index}>
              <Td>{customer[0]}</Td>
              <Td>{customer[1]}</Td>
              <Td>
                <Select
                  value={customer.settlementMode || ''}
                  onChange={(e) => {
                    const updatedCustomers = [...customers];
                    updatedCustomers[index].settlementMode = e.target.value;
                    setCustomers(updatedCustomers);
                  }}
                >
                  <option value="">Select</option>
                  <option value="Card">Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Multimode">Multimode</option>
                  <option value="UPI">UPI</option>
                </Select>
              </Td>
              <Td>
                <Select
                  value={customer.paymentMode || 'Full'}
                  onChange={(e) => {
                    const updatedCustomers = [...customers];
                    updatedCustomers[index].paymentMode = e.target.value;
                    setCustomers(updatedCustomers);
                  }}
                >
                  <option value="Full">Full</option>
                  <option value="Partial">Partial</option>
                </Select>
              </Td>
              <Td>
                <Input
                  type="number"
                  value={customer.partialAmount || ''}
                  disabled={customer.paymentMode !== 'Partial'}
                  onChange={(e) => {
                    const updatedCustomers = [...customers];
                    updatedCustomers[index].partialAmount = e.target.value;
                    setCustomers(updatedCustomers);
                  }}
                />
              </Td>
              <Td>
                <Button onClick={() => handleSettlement(index)}>Settle</Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default CustomerCreditSettlement;
