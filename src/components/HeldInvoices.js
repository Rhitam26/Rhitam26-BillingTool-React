import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { InvoiceContext } from './InvoiceContext';


// Styled components for layout and styling
const Container = styled.div`
  width: 80%;
  margin: 0 auto;
  margin-top: 50px;
  position: relative;
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

const ProductList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ProductItem = styled.li`
  margin-bottom: 10px;
`;

const HeldInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  // const { setSelectedInvoice } = useContext(InvoiceContext); // Use the context to set the selected invoice
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHeldInvoices = async () => {
      try {
        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'http://127.0.0.1:8000/get-held-invoices',
          headers: { 
            'Content-Type': 'application/json'
          }
        };

      const response = await axios.get('http://127.0.0.1:8000/get-held-invoices', config);
        console.log('Held invoices:', response.data);
        // loop through each invoice, get the date key and change it from UNIX time tsamp to DD/MM/YYYY

        // setInvoices(response.data);
        // let temInv= response.data
        // temInv.forEach(invoice=>{
        //   if (invoice.date){
        //     // convert to int
        //     var date_unix = invoice.date;
        //     // convert to milliseconds
        //     var date = new Date(date_unix*1000);
        //     // year as 4 digits (YYYY)
        //     var year = date.getFullYear();
        //     // month as 2 digits (MM)
        //     var month = ("0" + (date.getMonth() + 1)).slice(-2);
        //     // date as 2 digits (DD)
        //     var day = ("0" + date.getDate()).slice(-2);
        //     // Hours part from the timestamp
        //     var hours = date.getHours();
        //     // Minutes part from the timestamp
        //     var minutes = "0" + date.getMinutes();

        //     console.log('Date:', day + '/' + month + '/' + year);
        //   }
        // })
        setInvoices(response.data);
       
      } catch (error) {
        console.error('Error fetching held invoices:', error);
      }
    };
    

    fetchHeldInvoices();
  }, []);

  const handleRowClick = (invoiceData) => {
    // Navigate to home page and pass the invoice data
    
    console.log("Fetching Old Invoice Data..");
    // console.log("For Customer",invoiceData.data.customer_name);
    navigate('/tool', { state: { invoiceData } });
    // remove the invoice from the held invoices
   sessionStorage.removeItem('invoiceData');

  };

  return (
    <Container>
      <h2>Held Invoices</h2>
      <Table>
        <thead>
          <tr>
            <Th>Time</Th>
            <Th>Invoice ID</Th>
            <Th>Customer</Th>
            <Th>Products</Th>
            <Th>Total Amount</Th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, index) => (
            <tr key={index} onClick={() => handleRowClick(invoice)}>
              <Td>{invoice.date}</Td>
              <Td>{invoice.InvoiceNumber}</Td>
              
              <Td>{invoice.customer_name}</Td>
              <Td>
                <ProductList>
                  {invoice.products.map((product, productIndex) => (
                    <ProductItem key={productIndex}>
                      {product[0]} - {product.product_quantity} @ ${product[1]} each 
                      <br />
                      Discount: INR {product[3]}
                      <br />
                      Total: INR{product[2]}
                    </ProductItem>
                  ))}
                </ProductList>
              </Td>
              <Td>INR {invoice.amount_paid}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default HeldInvoices;

