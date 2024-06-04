import { useEffect, useState } from 'react';

const useKeyboardInput = () => {
  const [input, setInput] = useState('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setInput((prevInput) => prevInput + event.key);
    };

    // Attach the event listener to the document
    document.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return input;
};

export default useKeyboardInput;
