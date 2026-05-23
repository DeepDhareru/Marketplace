import { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);

  const addToCompare = (product) => {
    if (compareList.find((p) => p._id === product._id)) {
      return toast.error('Already in compare list');
    }
    if (compareList.length >= 3) {
      return toast.error('You can compare up to 3 products');
    }
    setCompareList([...compareList, product]);
    toast.success('Added to compare!');
  };

  const removeFromCompare = (id) => {
    setCompareList(compareList.filter((p) => p._id !== id));
  };

  const clearCompare = () => setCompareList([]);

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);