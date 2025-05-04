import React, { useState, useEffect } from 'react';
 
 interface DelayTimerProps {
     onTimerComplete: () => void;
 }
 
 const DelayTimer: React.FC<DelayTimerProps> = ({ onTimerComplete }) => {
     const DELAY_MINUTES = .2;
     const [secondsLeft, setSecondsLeft] = useState(DELAY_MINUTES * 60);
     const [timerComplete, setTimerComplete] = useState(false);
 
     useEffect(() => {
         const timer = setInterval(() => {
             setSecondsLeft((prev) => {
                 if (prev <= 1) {
                     clearInterval(timer);
                     setTimerComplete(true);
                     return 0;
                 }
                 return prev - 1;
             });
         }, 1000);
 
         return () => clearInterval(timer);
     }, []);
 
     const formatTime = (totalSeconds: number) => {
         const minutes = Math.floor(totalSeconds / 60);
         const seconds = totalSeconds % 60;
         return `${minutes}:${seconds.toString().padStart(2, '0')}`;
     };
 
     return (
         <div className="flex flex-col items-center justify-center p-8 space-y-6">
             <h2 className="text-2xl font-semibold text-gray-800">
                 Delay Period
             </h2>
             <p className="text-lg text-gray-600 text-center max-w-2xl">
                 Please wait 20 minutes before proceeding to the final recall trial.
             </p>
             <div className="text-4xl font-bold text-blue-600">
                 {formatTime(secondsLeft)}
             </div>
             {timerComplete && (
                 <button
                     onClick={onTimerComplete}
                     className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                 >
                     Continue to Final Recall
                 </button>
             )}
         </div>
     );
 };
 
 export default DelayTimer;