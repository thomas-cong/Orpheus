import React, { useEffect, useState } from 'react';
 import './CountdownAnimation.css';
 
 interface CountdownDisplayProps {
     count: number;
 }
 
 const CountdownDisplay: React.FC<CountdownDisplayProps> = ({ count }) => {
     const [key, setKey] = useState(0);
 
     // Reset animation when count changes
     useEffect(() => {
         setKey(prev => prev + 1);
     }, [count]);
 
     return (
         <div className="flex items-center justify-center">
             <div 
                 key={key}
                 className="text-6xl font-bold text-blue-600 countdown-fade"
             >
                 {count}
             </div>
         </div>
     );
 };
 
 export default CountdownDisplay;