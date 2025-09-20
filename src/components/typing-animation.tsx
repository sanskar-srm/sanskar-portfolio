'use client';

import {useState, useEffect} from 'react';
import {cn} from '@/lib/utils';

interface TypingAnimationProps {
  text: string;
  className?: string;
}

export default function TypingAnimation({text, className}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    const intervalId = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(intervalId);
        setIsTyping(false);
      }
    }, 20); 

    return () => clearInterval(intervalId);
  }, [text]);

  return (
    <div className={cn(className, 'relative')}>
      {displayedText}
      <span className={cn('typing-cursor', { 'blink': !isTyping })}></span>
    </div>
  );
}
