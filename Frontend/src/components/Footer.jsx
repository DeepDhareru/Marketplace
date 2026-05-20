const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-center text-sm text-gray-500 dark:text-gray-400 py-6 mt-10 transition-colors duration-200">
      © {new Date().getFullYear()} Marketplace. Built with MERN Stack.
    </footer>
  );
};

export default Footer;