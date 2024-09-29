// import axios from 'axios';
// import styled from 'styled-components';
// import { useEffect, useState } from 'react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import * as XLSX from 'xlsx';

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


const Button = styled.button`
  padding: 10px 20px;
  border: 2px solid #28a745;
  background-color: #28a745;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
  display: block;
  margin: 0 auto;
  margin-top: 60px;
`;

const LowStockProducts = () => {
    const [lowStockProducts, setLowStockProducts] = useState([]);

   
  
    useEffect(() => {
      // Replace with your Google Sheets API URL
      const fetchLowStockProducts = async () => {
        try {
          const response = await axios.get('https://sheets.googleapis.com/v4/spreadsheets/1YvUhfiX6oBVpl67x7gD4iiChZPis17aNgMVSSEHRak4/values/Sheet4!A:C?key=AIzaSyCCSlM3bNmnEd0CqUbX5C7znDyh2jKFQGU');
          const products = response.data.values;
  
          // Filter products where current quantity is less than or equal to minimum quantity
            const filteredProducts = products.filter((product, index) => {
                if (index === 0) {
                return false;
                }
                return parseInt(product[1]) <= parseInt(product[2]);
            });
            console.log(filteredProducts);
  
          setLowStockProducts(filteredProducts);
        } catch (error) {
          console.error('Error fetching data from Google Sheets:', error);
        }
      };
  
      fetchLowStockProducts();
    }, []);

    const downloadExcel = () => {
      // Create a new workbook and add a worksheet
      const workbook = XLSX.utils.book_new();
      const worksheetData = [
        ['Product Name', 'Current Quantity', 'Minimum Quantity'],
        ...lowStockProducts.map(product => [
          product.product_name,
          product.current_quantity,
          product.minimum_quantity,
        ]),
      ];
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Low Stock Products');
  
      // Export the workbook to a file and trigger the download
      XLSX.writeFile(workbook, 'Low_Stock_Products.xlsx');
    };


    return (
        <Container>
          <h1>Low Stock Products</h1>
          <Table>
            <thead>
              <tr>
                <Th>Product Name</Th>
                <Th>Current Quantity</Th>
                <Th>Minimum Quantity</Th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map((product, index) => (
                <tr key={index}>
                  <Td>{product[0]}</Td>
                  <Td>{product[1]}</Td>
                  <Td>{product[2]}</Td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Button onClick={downloadExcel}>Download Excel</Button>

        </Container>
      );
    };


    
    export default LowStockProducts;
