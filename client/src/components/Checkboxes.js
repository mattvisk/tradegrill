import React, { useState } from 'react';

function App() {
  // Create a state variable to store the array of options
  const [options, setOptions] = useState(['Option 1', 'Option 2', 'Option 3']);
  const [selected, setSelected] = useState([]);

  // Function to handle when an option is selected
  function handleChange(e) {
    const selectedOption = e.target.value;
    if (selected.includes(selectedOption)) {
      // If the selected option is already in the array, remove it
      setSelected(selected.filter(option => option !== selectedOption));
    } else {
      // Otherwise, add it to the array
      setSelected([...selected, selectedOption]);
    }
  }

  return (
    <form>
      {options.map(option => (
        <label key={option}>
          <input
            type="checkbox"
            value={option}
            onChange={handleChange}
            checked={selected.includes(option)}
          />
          {option}
        </label>
      ))}
    </form>
  );
}
