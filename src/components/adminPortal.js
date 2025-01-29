import React, { useState } from 'react';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import axios from 'axios';

// Styled Components
const Container = styled.div`
  width: 90%;
  margin: 20px auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SyncButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const Filters = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
`;

const Th = styled.th`
  border: 1px solid #ddd;
  padding: 10px;
  background-color: #f4f4f4;
`;

const Td = styled.td`
  border: 1px solid #ddd;
  padding: 10px;
`;

const DownloadButton = styled.button`
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const AdminPortal = () => {
  const [customers, setCustomers] = useState([]); // Customer data for dropdown
  const [transactions, setTransactions] = useState([]); // Transactions data for table
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);

  console.log("Local Storage:", localStorage.getItem("role"));



  const getCustomers = async () => {
    console.log("INSIDE GET CUSTOMERS")
    try{
      const response = await axios.get(
        'https://sheets.googleapis.com/v4/spreadsheets/1YvUhfiX6oBVpl67x7gD4iiChZPis17aNgMVSSEHRak4/values/Sheet6!A:C?key=AIzaSyCCSlM3bNmnEd0CqUbX5C7znDyh2jKFQGU'
      );
      const rows = response.data.values;
      console.log('rows:', rows);
      let cust_lst = [];
      for (let i=1; i<rows.length; i++){
        cust_lst.push({id: i, name: rows[i][0]});
      }
      console.log('cust_lst:', cust_lst);
      setCustomers(cust_lst);
      // set the customers
      // customers = rows;
 
    }
    catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Fetch updated data from DB
  const handleSync = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://127.0.0.1:8000/update-invoice');
      await getCustomers();
      console.log('Customers:', customers);
      // setCustomers(cust);

      setLoading(false);
    } catch (error) {
      console.error('Error syncing data:', error);
      setLoading(false);
    }
  };

  // Fetch transactions
  const handleFetchTransactions = async () => {
    if (!fromDate || !toDate) {
      alert('Please select both From Date and To Date.');
      return;
    }

    console.log('selectedCustomer:', selectedCustomer); // Customer name
    try {
      setLoading(true);
      let data = {customerName: selectedCustomer || null,start_date:fromDate ,end_date: toDate};
      let headers = { 'Content-Type': 'application/json' };
      const balanceResponse = await axios.post('http://127.0.0.1:5000/get-filtered-invoices', data, headers);
      // console.log('balanceResponse:', balanceResponse.data);

      const invoice_data = balanceResponse.data;
      console.log('balanceTillFromDate:', invoice_data);

      // fetch customer current balance
      const customer_url ='http://127.0.0.1:5000/get-customers/'+selectedCustomer;
      console.log('customer_url:', customer_url);
      const currentBalanceResponse = await axios.get(customer_url, headers);
      let existing_balance= currentBalanceResponse.data[0]['customerBalance'];
      console.log('existing_balance:', existing_balance);

      // process the data

      // loop through the data and get description and amount
      let data_list = [];
      let total_debit = 0.0;
      let total_credit = 0.0;
      let net_balance = 0.0;
      data_list.push([" "," "," ","BALANCE", existing_balance," "]);
      let settelemt_payed = 0;
      for (let i=0; i<invoice_data.length; i++){
        let invoice_number = invoice_data[i]['InvoiceNumber'];
        let invoice_date = invoice_data[i]['date'];
        let amount_payed = parseFloat(invoice_data[i]['upi']) + parseFloat(invoice_data[i]['cash']);
        total_credit = total_credit + amount_payed;
        invoice_date = parseInt(invoice_date/1000);
        console.log('invoice_date:', invoice_date);
        // convert the date from unix timestamp to date
        invoice_date = new Date(invoice_date *1000);
        invoice_date = invoice_date.toLocaleDateString('en-GB');

        for (let j= 0, len=invoice_data[i]['products'].length; j<len; j++){
         let product_name = invoice_data[i]['products'][j][0];
          let unit_price = invoice_data[i]['products'][j][1];
          let quantity = invoice_data[i]['products'][j][2];
          let discount = invoice_data[i]['products'][j][3];
          let amount = (parseFloat(unit_price) * parseFloat(quantity)) - parseFloat(discount);
          total_debit = total_debit + amount;
          data_list.push([invoice_number, invoice_date, product_name,quantity, amount]);
        }

        data_list.push([invoice_number, invoice_date, 'Return/Payments'," ", '', amount_payed]);
  }

  // final_balance = parseFloat(existing_balance) - parseFloat(settelemt_payed);
  net_balance = (parseFloat(existing_balance) + total_debit) - total_credit;
  data_list.push([" "," "," ","BALANCE", net_balance," "]);


  console.log('data_list:', data_list);
  setTransactions(data_list);
      // setTransactions(balanceResponse.data);
      setLoading(false);

}
    catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    }
  };

  // Export table to Excel
  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(transactions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer History');
    XLSX.writeFile(workbook, 'Customer_History.xlsx');
  };

  return (
    <Container>
      <Header>
        <h2>Admin Portal</h2>
        <SyncButton onClick={handleSync}>{loading ? 'Syncing...' : 'Sync'}</SyncButton>
      </Header>

      {/* Filters */}
      <Filters>
        <Select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
        >
          <option value="">All Customers</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.name}>
              {customer.name}
            </option>
          ))}
        </Select>
        <Input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          required
        />
        <Input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          required
        />
        <SyncButton onClick={handleFetchTransactions}>
          {loading ? 'Fetching...' : 'Fetch Transactions'}
        </SyncButton>
      </Filters>

      {/* Customer History Table */}
      {transactions.length > 0 && (
        <>
          <Table>
            <thead>
              <tr>
                <Th>INVOICE NUMBER</Th>
                <Th>DATE</Th>
                <Th>PRODUCT NAME</Th>
                <Th>QUANTITY</Th>
                <Th>DEBIT</Th>
                <Th>CREDIT</Th>

              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, index) => (
                <tr key={index}>
                  <Td>{txn[0]}</Td>
                  <Td>{txn[1]}</Td>
                  <Td>{txn[2]}</Td>
                  <Td>{txn[3]}</Td>
                  <Td>{txn[4]}</Td>
                  <Td>{txn[5]}</Td>

                </tr>
              ))}
            </tbody>
          </Table>
          <DownloadButton onClick={handleDownload}>Download</DownloadButton>
        </>
      )}
    </Container>
  );
};

export default AdminPortal;
