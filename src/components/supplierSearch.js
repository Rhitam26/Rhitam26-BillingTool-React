import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const DropdownContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const DropdownItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  &:hover {
    background-color: #f9f9f9;
  }
`;

const AddNewSupplier = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  background-color: #f0faff;
  color: #007bff;
  &:hover {
    background-color: #e6f7ff;
  }
`;

const SupplierSearchInputWrapper = styled.div`
  position: relative;
`;

const SupplierSearchInput = ({
  supplierSuggestions,
  handleSupplierSearch,
  handleSupplierSelect,
  handleAddNewSupplier,
  index,
  item,
  setSupplierSuggestions,
}) => {
  const wrapperRef = useRef();

  const handleClickOutside = (event) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setSupplierSuggestions([]); // Close the dropdown
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Escape') {
      setSupplierSuggestions([]); // Close the dropdown on `Esc`
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <SupplierSearchInputWrapper ref={wrapperRef} >
      <input
        type="text"
        value={item.supplierName}
        onChange={(e) => handleSupplierSearch(e.target.value, index)}
        placeholder="Search Supplier"
        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {supplierSuggestions.length > 0 && (
        <DropdownContainer>
          {supplierSuggestions.map((supplier, i) => (
            <DropdownItem
              key={i}
              onClick={() => handleSupplierSelect(supplier, index)}
            >
              {supplier.name}
            </DropdownItem>
          ))}
          <AddNewSupplier onClick={handleAddNewSupplier}>
            + Add New Supplier
          </AddNewSupplier>
        </DropdownContainer>
      )}
    </SupplierSearchInputWrapper>
  );
};

export default SupplierSearchInput;
