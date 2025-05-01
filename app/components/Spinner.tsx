import {useSpring, animated} from '@react-spring/web';
import {useEffect} from 'react';

interface SpinnerProps {
  size?: number;
  color?: string;
  secondaryColor?: string;
  thickness?: number;
  className?: string;
}

export default function Spinner({
  size = 40,
  color = '#000000',
  secondaryColor = '#e5e5e5',
  thickness = 4,
  className = '',
}: SpinnerProps) {
  const spinnerStyle = useSpring({
    from: {rotate: 0},
    to: {rotate: 360},
    loop: true,
    config: {
      duration: 1000,
    },
  });

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <animated.div
        style={{
          width: size,
          height: size,
          transform: spinnerStyle.rotate.to(r => `rotate(${r}deg)`),
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - thickness) / 2}
            stroke={secondaryColor}
            strokeWidth={thickness}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - thickness) / 2}
            stroke={color}
            strokeWidth={thickness}
            fill="none"
            strokeDasharray={Math.PI * (size - thickness)}
            strokeDashoffset={(Math.PI * (size - thickness)) / 3}
            strokeLinecap="round"
          />
        </svg>
      </animated.div>
    </div>
  );
} 