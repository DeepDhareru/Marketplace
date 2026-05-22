const VerifiedBadge = ({ size = 'sm' }) => {
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  return (
    <span className={`inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium rounded-full ${sizes[size]}`}>
      ✓ Verified Seller
    </span>
  );
};

export default VerifiedBadge;