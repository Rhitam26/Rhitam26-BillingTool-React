import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

// Styled components
const Container = styled.div`
  width: 60%;
  margin: 0 auto;
  margin-top: 50px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
`;

const Input = styled.input`
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 100%;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
`;

const AddUserForm = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  const navigate = useNavigate();

  const handleSubmit = () => {
    // Logic to submit the form to a database or Google Sheets
    console.log({ name, phoneNumber, address });
    const response = axios.post('http://127.0.0.1:5000/add-customer', {
      name,
      phoneNumber,
      address,
    });

    console.log(response);



    // Navigate back to the home page after adding user
    navigate('/');
  };

  return (
    <Container>
      <h2>Add New Customer</h2>
      <form>
        <label>Name</label>
        <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        <label>Phone Number</label>
        <Input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />

        <label>Address</label>
        <Input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />

        <Button onClick={handleSubmit}>Add Customer</Button>
      </form>
    </Container>
  );
};

export default AddUserForm;
