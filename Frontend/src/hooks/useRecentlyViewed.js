import { useState, useEffect } from 'react';

const useRecentlyViewed = (currentProductId) => {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    if (!currentProductId) return;

    const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const filtered = stored.filter((id) => id !== currentProductId);
    const updated = [currentProductId, ...filtered].slice(0, 6);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  }, [currentProductId]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setRecentProducts(stored.filter((id) => id !== currentProductId));
  }, [currentProductId]);

  return recentProducts;
};

export default useRecentlyViewed;