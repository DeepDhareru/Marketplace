const STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const OrderTimeline = ({ status }) => {
  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="flex items-center justify-between w-full my-4">
      {STEPS.map((step, index) => (
        <div key={step} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              index <= currentIndex
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-400'
            }`}>
              {index < currentIndex ? '✓' : index + 1}
            </div>
            <p className={`text-xs mt-1 capitalize font-medium ${
              index <= currentIndex ? 'text-blue-600' : 'text-gray-400'
            }`}>
              {step}
            </p>
          </div>
          {index < STEPS.length - 1 && (
            <div className={`flex-1 h-1 mx-1 rounded ${
              index < currentIndex ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderTimeline;