import { useEffect, useState } from 'react';

const useRatingInput = (setRating: (rating: number) => void): string => {
  const [key, setKey] = useState<string>(Math.random().toString());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;
      if (['1', '2', '3', '4', '5'].includes(key)) {
        setRating(Number(key));
        setKey(Math.random().toString());
      }
    };

    // Attach the event listener to the document
    document.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setRating]);

  return key;
};

export default useRatingInput;
