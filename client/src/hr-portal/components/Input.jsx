

import React from 'react';

const Input = ({ id, label, type = 'text', placeholder, value, onChange, name, required = false, step }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        id={id}
        // The 'name' attribute is crucial. It tells the handleChange function which piece of state to update.
        // It must match the key in your formData state object.
        name={name || id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        step={step} // Added for number inputs like 'Holidays Left'
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>
  );
};

export default Input;
