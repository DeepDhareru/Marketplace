import { useEffect, useState } from 'react';

const FlashSaleTimer = ({ endTime, size = 'md' }) => {
  const [timeLeft, setTimeLeft] = useState({});
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(endTime) - new Date();
      if (diff <= 0) {
        setExpired(true);
        return;
      }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  if (expired) return (
    <span className="text-xs text-red-500 font-medium">Sale ended</span>
  );

  const pad = (n) => String(n).padStart(2, '0');

  if (size === 'sm') return (
    <div className="flex items-center gap-1 text-xs font-bold text-red-600">
      <span>⏱</span>
      <span>{pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      {[
        { label: 'HRS', value: timeLeft.hours },
        { label: 'MIN', value: timeLeft.minutes },
        { label: 'SEC', value: timeLeft.seconds },
      ].map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="bg-red-600 text-white text-lg font-bold w-12 h-12 rounded-lg flex items-center justify-center">
            {pad(unit.value)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{unit.label}</p>
        </div>
      ))}
    </div>
  );
};

export default FlashSaleTimer;