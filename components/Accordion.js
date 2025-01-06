// components/Accordion.js

import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid';

const Accordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg mb-4">
      <button
        className="w-full flex justify-between items-center p-4 bg-gray-200 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium">{title}</span>
        {isOpen ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-600" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 bg-gray-100">
          <pre className="overflow-x-auto">
            <code className="text-sm text-gray-800">{children}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default Accordion;
