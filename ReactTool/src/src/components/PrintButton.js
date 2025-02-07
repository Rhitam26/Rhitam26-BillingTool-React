import React, { useRef , useState, createRef} from 'react';
import styled from 'styled-components';
import { useReactToPrint } from 'react-to-print';

// Define PrintableContent styled component
const PrintableContent = styled.div`
    display: none;
    @media print {
        display: block;
    }
`;



class ComponentToPrint extends React.Component{
  render()
{
  return(
    <div>
      <h1>Invoice</h1>
      <p>Customer Name: {this.props.customerName}</p>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {this.props.products.map((product, index) => (
            <tr key={index}>
              <td>{product.name}</td>
              <td>${product.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}}

const htmlContent = `
  <h1>Invoice</h1>
  <p>Customer Name: John Doe</p>
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Price</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Product 1</td>
        <td>$5</td>
      </tr>
      <tr>
        <td>Product 2</td>
        <td>$8</td>
      </tr>
    </tbody>
  </table>
`;

const PrintButton = ({ customerName, products }) => {
  // console.log(customerName)
  // console.log(products)
  const componentRef = React.useRef()
  console.log("REF", componentRef.current)

 // print function to print custimer name and products
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (  
    <div>
    {/* ComponentToPrint is not visible on screen but is printable */}
    <div style={{ display: 'none' }}>
      <ComponentToPrint ref={componentRef} customerName={customerName} products={products} />
    </div>
    <button onClick={() => handlePrint()}>Print this out!</button>
  </div>
  );
};


export default PrintButton;