import React, { useState } from 'react';
import { useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem;
  font-family: 'Inter', sans-serif;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2rem;
  background: linear-gradient(90deg, #2563eb, #4f46e5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Form = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  border: 1px solid #e5e7eb;
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: white;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;

  ${props => props.primary && `
    background: linear-gradient(90deg, #2563eb, #4f46e5);
    color: white;
    border: none;

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
  `}

  ${props => props.secondary && `
    background: #f3f4f6;
    color: #4b5563;
    border: 1px solid #e5e7eb;

    &:hover {
      background: #e5e7eb;
    }
  `}

  ${props => props.danger && `
    background: #fee2e2;
    color: #dc2626;
    border: none;

    &:hover {
      background: #fecaca;
    }
  `}
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Th = styled.th`
  padding: 1rem;
  background: #f8fafc;
  color: #4b5563;
  font-weight: 500;
  text-align: left;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e5e7eb;
`;

const Td = styled.td`
  padding: 1rem;
  color: #1a1a1a;
  border-bottom: 1px solid #e5e7eb;
`;

const SecondaryBarcodeSection = styled.div`
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-top: 1.5rem;
  border: 1px solid #e5e7eb;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #4b5563;
`;

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  border: 1px solid #e5e7eb;
  cursor: pointer;

  &:checked {
    background-color: #2563eb;
    border-color: #2563eb;
  }
`;

// Product management component
const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showSecondaryBarcode, setShowSecondaryBarcode] = useState({
    primary: false,
    kaccha: false
  });

  // Initial form state

  const initialFormState = {
    primary: {
      main: {
        barcodeNumber: '',
        name: '',
        category: '',
        default_price: '',
        quantity: '',
        minimum_quantity: '',
        purchase_price: '',
        sales_price_1: '',
        sales_price_2: '',
        warehouse: 'W1',
      },
      secondary: {
        barcodeNumber: '',
        name: '',
        category: '',
        default_price: '',
        quantity: '',
        minimum_quantity: '',
        purchase_price: '',
        sales_price_1: '',
        sales_price_2: '',
        warehouse: 'W1',
      }
    },
    kaccha: {
      main: {
        barcodeNumber: '',
        name: '',
        category: '',
        default_price: '',
        quantity: '',
        minimum_quantity: '',
        purchase_price: '',
        sales_price_1: '',
        sales_price_2: '',
        warehouse: 'W1',
      },
      secondary: {
        barcodeNumber: '',
        name: '',
        category: '',
        default_price: '',
        quantity: '',
        minimum_quantity: '',
        purchase_price: '',
        sales_price_1: '',
        sales_price_2: '',
        warehouse: 'W1',
      }
    }
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const fetchProducts = async () => {    
      try {
        const response = await axios.get(
          'https://sheets.googleapis.com/v4/spreadsheets/1YvUhfiX6oBVpl67x7gD4iiChZPis17aNgMVSSEHRak4/values/product!A:Z?key=AIzaSyCCSlM3bNmnEd0CqUbX5C7znDyh2jKFQGU'
        );
        const rows = response.data.values;
        const products = rows.slice(1).map((row) => ({
          id: Date.now() + Math.random(), // Ensure unique ID
          primary: {
            main: {
              barcodeNumber: row[1] || '',
              name: row[0] || '',
              category: row[2] || '',
              default_price: row[3] || '',
              quantity: row[4] || '',
              minimum_quantity: row[5] || '',
              purchase_price: row[10] || '',
              sales_price_1: row[7] || '',
              sales_price_2: row[11] || '',
              sales_price_3: row[12] || '',
              sales_price_4: row[13] || '',
              sales_price_5: row[14] || '',
              sales_price_6: row[15] || '',
              warehouse: row[17] || 'W1'
            },
            secondary: null // No secondary data from API
          },
          kaccha: {
            main: {
              barcodeNumber: row[1] || '',
              name: row[0] || '',
              category: row[2] || '',
              default_price: row[3] || '',
              quantity: row[4] || '',
              minimum_quantity: row[5] || '',
              purchase_price: row[19] || '',
              sales_price_1: row[20] || '',
              sales_price_2: row[21] || '',
              warehouse: row[9] || 'W1'
            },
            secondary: null // No secondary data from API
          }
        }));
        setProducts(products);
      }
      catch (error) {
        console.error('Error fetching products: ', error);
      }
    };

    if (products.length === 0) {
      fetchProducts();
    }
  }, [products]);


  // Handle form input changes
  const handleInputChange = (e, type, isSecondary = false) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [isSecondary ? 'secondary' : 'main']: {
          ...prev[type][isSecondary ? 'secondary' : 'main'],
          [name]: value
        }
      }
    }));
  };

  const toggleSecondaryBarcode = (type) => {
    setShowSecondaryBarcode(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };


  // Add new product with all details
  const handleAddProduct = (e) => {
    e.preventDefault();
    const newProduct = {
      id: Date.now(),
      primary: {
        main: formData.primary.main,
        secondary: showSecondaryBarcode.primary ? formData.primary.secondary : null
      },
      kaccha: {
        main: formData.kaccha.main,
        secondary: showSecondaryBarcode.kaccha ? formData.kaccha.secondary : null
      }
    };


    setProducts(prev => [...prev, newProduct]);
    setFormData(initialFormState);
    setIsAddingProduct(false);
    setShowSecondaryBarcode({ primary: false, kaccha: false });
  };

  // Edit product
  const handleEditProduct = (e) => {
    e.preventDefault();
    setProducts(prev =>
      prev.map(product =>
        product.id === editingProduct.id ? { ...formData, id: product.id } : product
      )
    );
    setEditingProduct(null);
    setFormData(initialFormState);
  };

  // Delete product
  const handleDeleteProduct = (id) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  // Start editing a product
  const startEditing = (product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowSecondaryBarcode(!!product.secondaryBarcode);
  };

  const renderProductForm = (type, title) => (
    <div className="space-y-6">
      <Form>
        <FormTitle>{title}</FormTitle>
        
        {/* Main Product Details */}
        <InputGroup>
          <Label>Barcode Number</Label>
          <Input
            type="text"
            name="barcodeNumber"
            value={formData[type].main.barcodeNumber}
            onChange={(e) => handleInputChange(e, type)}
            required
          />
        </InputGroup>

        <InputGroup>
          <Label>Name</Label>
          <Input
            type="text"
            name="name"
            value={formData[type].main.name}
            onChange={(e) => handleInputChange(e, type)}
            required
          />
        </InputGroup>

        <InputGroup>
          <Label>Category</Label>
          <Input
            type="text"
            name="category"
            value={formData[type].main.category}
            onChange={(e) => handleInputChange(e, type)}
            required
          />
        </InputGroup>

        <InputGroup>
          <Label>Quantity</Label>
          <Input
            type="number"
            name="quantity"
            value={formData[type].main.quantity}
            onChange={(e) => handleInputChange(e, type)}
            required
          />
        </InputGroup>
        <InputGroup>
          <Label>Purchase Price</Label>
          <Input
            type="number"
            name="purchase_price"
            value={formData[type].main.purchase_price}
            onChange={(e) => handleInputChange(e, type)}
            required
          />
        </InputGroup>
        <InputGroup>
          <Label>Purchase Price</Label>
          <Input
            type="number"
            name="purchase_price"
            value={formData[type].main.purchase_price}
            onChange={(e) => handleInputChange(e, type)}
            required
          />
        </InputGroup>
        <InputGroup>
          <Label>Default Price</Label>
          <Input
            type="number"
            name="default_price"
            value={formData[type].main.default_price}
            onChange={(e) => handleInputChange(e, type)}
            required
          />
        </InputGroup>
        <InputGroup>
          <Label>Silver Price</Label>
          <Input
            type="number"
            name="sales_price_1"
            value={formData[type].main.sales_price_1}
            onChange={(e) => handleInputChange(e, type)}
            required
          />
        </InputGroup>
        <InputGroup>
          <Label>Gold Price</Label>
          <Input
            type="number"
            name="sales_price_2"
            value={formData[type].main.sales_price_2}
            onChange={(e) => handleInputChange(e, type)}
            required
          />
        </InputGroup>

        <InputGroup>
          <Label>Platinum Price</Label>
          <Input
            type="number"
            name="sales_price_3"
            value={formData[type].main.sales_price_3}
            onChange={(e) => handleInputChange(e, type)}
            required
          />
        </InputGroup>
        <InputGroup>
          <Label>Diamond Price</Label>
          <Input
            type="number"
            name="sales_price_4"
            value={formData[type].main.sales_price_4}
            onChange={(e) => handleInputChange(e, type)}
            required
          />
        </InputGroup>
        <InputGroup>
          <Label>Sales Price 5</Label>
          <Input
            type="number"
            name="sales_price_5"
            value={formData[type].main.sales_price_5}
            onChange={(e) => handleInputChange(e, type)}
            required
          />
        </InputGroup>

        <InputGroup>
          <Label>Sales Price 6</Label>
          <Input
            type="number"
            name="sales_price_6"
            value={formData[type].main.sales_price_6}
            onChange={(e) => handleInputChange(e, type)}
            required
          />
        </InputGroup>


        

        <InputGroup>
          <Label>Warehouse</Label>
          <Select
            name="warehouse"
            value={formData[type].main.warehouse}
            onChange={(e) => handleInputChange(e, type)}
            required
          >
            <option value="W1">W1</option>
            <option value="W2">W2</option>
            <option value="shop">Shop</option>
          </Select>
        </InputGroup>

        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={showSecondaryBarcode[type]}
            onChange={() => toggleSecondaryBarcode(type)}
          />
          Add Secondary Barcode
        </CheckboxLabel>

        {/* Secondary Barcode Section */}
        {showSecondaryBarcode[type] && (
          <SecondaryBarcodeSection>
            <FormTitle>Secondary Barcode Details</FormTitle>
            
            <InputGroup>
              <Label>Secondary Barcode Number</Label>
              <Input
                type="text"
                name="barcodeNumber"
                value={formData[type].secondary.barcodeNumber}
                onChange={(e) => handleInputChange(e, type, true)}
                required
              />
            </InputGroup>

            <InputGroup>
              <Label>Secondary Name</Label>
              <Input
                type="text"
                name="name"
                value={formData[type].secondary.name}
                onChange={(e) => handleInputChange(e, type, true)}
                required
              />
            </InputGroup>

            <InputGroup>
              <Label>Secondary Category</Label>
              <Input
                type="text"
                name="category"
                value={formData[type].secondary.category}
                onChange={(e) => handleInputChange(e, type, true)}
                required
              />
            </InputGroup>

            <InputGroup>
              <Label>Secondary Quantity</Label>
              <Input
                type="number"
                name="quantity"
                value={formData[type].secondary.quantity}
                onChange={(e) => handleInputChange(e, type, true)}
                required
              />
            </InputGroup>

            <InputGroup>
              <Label>Secondary Warehouse</Label>
              <Select
                name="warehouse"
                value={formData[type].secondary.warehouse}
                onChange={(e) => handleInputChange(e, type, true)}
                required
              >
                <option value="W1">W1</option>
                <option value="W2">W2</option>
                <option value="shop">Shop</option>
              </Select>
            </InputGroup>
          </SecondaryBarcodeSection>
        )}
      </Form>
    </div>
  );

  return (
    <Container>
      <Title>Product Management System</Title>

      {(isAddingProduct || editingProduct) && (
        <>
          <div className="grid grid-cols-2 gap-6">
            {renderProductForm('primary', 'Primary Product Details')}
            {renderProductForm('kaccha', 'Kaccha Product Details')}
          </div>

          <ButtonGroup>
            <Button primary type="submit" onClick={handleAddProduct}>
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
            <Button
              secondary
              type="button"
              onClick={() => {
                setIsAddingProduct(false);
                setEditingProduct(null);
                setFormData(initialFormState);
                setShowSecondaryBarcode({ primary: false, kaccha: false });
              }}
            >
              Cancel
            </Button>
          </ButtonGroup>
        </>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <FormTitle>Products List</FormTitle>
          {!isAddingProduct && !editingProduct && (
            <Button primary onClick={() => setIsAddingProduct(true)}>
              Add New Product
            </Button>
          )}
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Type</Th>
              <Th>Barcode</Th>
              <Th>Name</Th>
              <Th>Category</Th>
              <Th>Quantity</Th>
              <Th>Warehouse</Th>
              <Th>Secondary Barcode</Th>
              <Th>Purchase Amount</Th>
              <Th>Sales Price 1</Th>
              <Th>Sales Price 2</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <>
                <tr key={`primary-${product.id}`}>
                  <Td>Primary</Td>
                  <Td>{product.primary.main.barcodeNumber}</Td>
                  <Td>{product.primary.main.name}</Td>
                  <Td>{product.primary.main.category}</Td>
                  <Td>{product.primary.main.quantity}</Td>
                  <Td>{product.primary.main.warehouse}</Td>
                  <Td>{product.primary.secondary ? 'Yes' : 'No'}</Td>
                  <Td>{product.primary.main.purchase_price}</Td>
                  <Td>{product.primary.main.sales_price_1}</Td>
                  <Td>{product.primary.main.sales_price_2}</Td>
                  
                  <Td>
                    <ButtonGroup>
                      <Button secondary onClick={() => startEditing(product)}>
                        Edit
                      </Button>
                      <Button danger onClick={() => handleDeleteProduct(product.id)}>
                        Delete
                      </Button>
                    </ButtonGroup>
                  </Td>
                </tr>
                <tr key={`kaccha-${product.id}`}>
                  <Td>Kaccha</Td>
                  <Td>{product.kaccha.main.barcodeNumber}</Td>
                  <Td>{product.kaccha.main.name}</Td>
                  <Td>{product.kaccha.main.category}</Td>
                  <Td>{product.kaccha.main.quantity}</Td>
                  <Td>{product.kaccha.main.warehouse}</Td>
                  <Td>{product.kaccha.secondary ? 'Yes' : 'No'}</Td>
                  <Td>{product.kaccha.main.purchase_price}</Td>
                  <Td>{product.kaccha.main.sales_price_1}</Td>
                  <Td>{product.kaccha.main.sales_price_2}</Td>

                  <Td>
                    <ButtonGroup>
                      <Button secondary onClick={() => startEditing(product)}>
                        Edit
                      </Button>
                      <Button danger onClick={() => handleDeleteProduct(product.id)}>
                        Delete
                      </Button>
                    </ButtonGroup>
                  </Td>
                </tr>
              </>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default ProductManagement;