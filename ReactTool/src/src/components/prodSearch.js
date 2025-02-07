import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';

const ProdSearchableDropdown = (prop) => {
  let [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with your Google Sheets URL
    const sheetId = 'YOUR_SHEET_ID';
    const apiKey = 'YOUR_API_KEY';
    const range = 'Sheet1!A:A'; // Adjust the range according to your needs
    // console.log("sheetId",sheetId);

  }, []);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minWidth: '300px',
    }),
  };

  const fetchProducts = async (query) => {
    console.log('query:', query);
    query = query.toLowerCase();
    try {
        const response = await axios.get(
          'https://sheets.googleapis.com/v4/spreadsheets/1YvUhfiX6oBVpl67x7gD4iiChZPis17aNgMVSSEHRak4/values/Sheet1!A:C?key=AIzaSyCCSlM3bNmnEd0CqUbX5C7znDyh2jKFQGU'
        );
    
        const rows = response.data.values;
        console.log('rows:', rows);
        // get the list of products that contains query in either name or id
        // let foundProduct = rows.filter((row) => String(row[0]).includes(query) || String(row[2]).includes(query));
        let foundProduct=[]
        for (let i = 0; i < rows.length; i++) {
          console.log('ID:', rows[i][0]);
          console.log('Name:', rows[i][2]);
  
          if (String(rows[i][0]).toLowerCase().includes(query) || String(rows[i][2]).toLowerCase().includes(query)){
            foundProduct.push(rows[i]);
          }
        }
        console.log('foundProduct:', foundProduct)
        if (foundProduct)
          {
            options = foundProduct
            setOptions(options);
            // console.log('options:', options);
          }
        
        else
          console.log('No results found');
        // setLoading(false);
        
      } catch (error) {
        console.error('Error fetching search results:', error);
        // setLoading(false);
      }


  }

  return (
    <div>
     
        <Select
        
          options={options}
          value={options}
          styles={customStyles}
          placeholder="Select or search..."
        onChange={fetchProducts}
        />
      
    </div>
  );
};

export default ProdSearchableDropdown;
