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

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
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
  margin-top: 20px;
  display: block;
  margin: 0 auto;
`;

const LowStockProducts = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    // Replace with your Google Sheets API URL
    const fetchLowStockProducts = async () => {
      try {
        const response = await axios.get(
          'https://sheets.googleapis.com/v4/spreadsheets/1YvUhfiX6oBVpl67x7gD4iiChZPis17aNgMVSSEHRak4/values/product!A:F?key=AIzaSyCCSlM3bNmnEd0CqUbX5C7znDyh2jKFQGU'
        );
        const products = response.data.values;

        // ignoring the header row if the name is 'Product Name'
        if (products[0][0] === 'Product Name') {
          products.shift();
        }


        setLowStockProducts(products);
        setFilteredProducts(products);
      } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
      }
    };

    fetchLowStockProducts();
  }, []);

  useEffect(() => {
    // Filter products based on search term
    const filtered = lowStockProducts.filter((product) =>
      product[0]?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, lowStockProducts]);

  const downloadExcel = () => {
    // Create a new workbook and add a worksheet
    const workbook = XLSX.utils.book_new();
    const worksheetData = [
      ['Product Name', 'Bar Code Number', 'Category','Current Quantity'],
      ...filteredProducts.map((product) => [
        product[0],
        product[1],
        product[2],
        product[3],
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
      <SearchInput
        type="text"
        placeholder="Search by product name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Table>
        <thead>
          <tr>
            <Th>Product Name</Th>
            <Th>Bar Code Number</Th>
            <Th>Category</Th>
            <Th>Current Quantity</Th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product, index) => (
            <tr key={index}>
              <Td>{product[0]}</Td>
              <Td>{product[1]}</Td>
              <Td>{product[2]}</Td>
              <Td>{product[3]}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button onClick={downloadExcel}>Download Excel</Button>
    </Container>
  );
};

export default LowStockProducts;
