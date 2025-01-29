import React from "react";

export class ComponentToPrint extends React.PureComponent {
    render({products}) {
      return (
        <table>
          <h2>Invoice</h2>
        {/* <p>Customer Name: {customerName}</p> */}
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th> 
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index}>
                <td>{product.name}</td>
                <td>${product.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </table>
      );
    }
  }