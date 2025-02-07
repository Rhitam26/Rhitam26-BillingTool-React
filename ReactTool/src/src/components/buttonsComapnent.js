import React from 'react';

const ButtonsComponent = ({ onButtonClick }) => {
  return (
    <div className="buttons-container">
      <button onClick={() => onButtonClick(1)}>Button 1</button>
      <button onClick={() => onButtonClick(2)}>Button 2</button>
      <button onClick={() => onButtonClick(3)}>Button 3</button>
      <button onClick={() => onButtonClick(4)}>Button 4</button>
      <button onClick={() => onButtonClick(5)}>Button 5</button>
      <button onClick={() => onButtonClick(6)}>Button 6</button>
    </div>
  );
};

export default ButtonsComponent;
