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
        const response = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/1YvUhfiX6oBVpl67x7gD4iiChZPis17aNgMVSSEHRak4/values/Sheet3!A:C?key=AIzaSyCCSlM3bNmnEd0CqUbX5C7znDyh2jKFQGU`
        );
        const rows = response.data.values;
        console.log("SHEET ROWS",rows);

        // Parse the JSON data stored in the second column and ignore the first row
        rows.shift();

        for (var i = 0; i < rows.length; i++) {
          let data = rows[i][1];
          // remove double quotes
          
          console.log("Data",data);
          // replace double quotes with single quotes
          data = data.replace(/"/g, "'");
        }

        
        const parsedInvoices = rows.map((row) => {
          return {
            invoiceId: row[0], // Column 0: Invoice ID
            data: JSON.parse(row[1]), // Column 1: JSON data
          };
        });


        setInvoices(parsedInvoices);
      } catch (error) {
        console.error('Error fetching held invoices:', error);
      }
    };

    fetchHeldInvoices();
  }, []);

  const handleRowClick = (invoiceData) => {
    // Navigate to home page and pass the invoice data
    
    console.log("Fetching Old Invoice Data..");
    console.log("For Customer",invoiceData.data.customer_name);
    navigate('/', { state: { invoiceData } });
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
              <Td>{invoice.data.time}</Td>
              <Td>{invoice.data.invoice_id}</Td>
              
              <Td>{invoice.data.customer_name}</Td>
              <Td>
                <ProductList>
                  {invoice.data.products.map((product, productIndex) => (
                    <ProductItem key={productIndex}>
                      {product.product_name} - {product.product_quantity} @ ${product.product_price} each 
                      <br />
                      Discount: INR {product.discount}
                      <br />
                      Total: INR{product.total_price}
                    </ProductItem>
                  ))}
                </ProductList>
              </Td>
              <Td>INR {invoice.data.total_price}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default HeldInvoices;

