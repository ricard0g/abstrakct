import {useEffect, useState, useRef} from 'react';
import {useLocation} from '@remix-run/react';

export default function Cursor() {
  const [position, setPosition] = useState({x: -100, y: -100});
  const [isHovering, setIsHovering] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const location = useLocation();

  // Reset cursor state on route changes
  useEffect(() => {
    setIsHovering(false);
    setIsLink(false);
  }, [location.pathname]);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setPosition({x: e.clientX, y: e.clientY});
    };

    // Check if element is clickable
    const isClickable = (element: HTMLElement | null): boolean => {
      if (!element) return false;

      return (
        element.tagName === 'A' ||
        element.tagName === 'BUTTON' ||
        element.getAttribute('role') === 'button' ||
        !!element.closest('a') ||
        !!element.closest('button') ||
        !!element.closest('[role="button"]') ||
        element.classList.contains('grid > div') ||
        !!element.closest('.grid > div')
      );
    };

    // Event delegation handlers
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (isClickable(target)) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (isClickable(target)) {
        setIsHovering(false);
      }
    };

    // Check for links - triggered on any mouse movement
    const checkForLinks = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsLink(isClickable(target));
    };

    // Instead of just finding grid, add global event listeners
    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousemove', checkForLinks);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousemove', checkForLinks);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, [location.pathname]);

  // Dynamic cursor styles based on hovering state
  const ringSize = isHovering ? '80px' : '40px';
  const dotSize = isHovering ? '8px' : '5px';
  const ringBgColor = isHovering
    ? 'rgba(10, 10, 10, 0.2)'
    : 'rgba(20, 20, 20, 0.1)';
  const dotBgColor = isHovering ? '#111' : '#333';
  const ringBorderColor = isHovering ? '#333' : '#222';
  const transition =
    'width 0.3s ease, height 0.3s ease, background-color 0.3s ease, transform 0.3s ease';

  return (
    <>
      <div
        className={`hidden md:block fixed pointer-events-none z-50 rounded-full border mix-blend-difference ${isLink ? 'cursor-link' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: ringSize,
          height: ringSize,
          backgroundColor: isLink ? 'rgba(255, 255, 255, 0.2)' : ringBgColor,
          borderColor: isLink ? '#fff' : ringBorderColor,
          borderWidth: isLink ? '2px' : '1px',
          transform: isLink
            ? 'translate(-50%, -50%) scale(1.1)'
            : 'translate(-50%, -50%)',
          transition,
        }}
      ></div>

      <div
        className="hidden md:block fixed pointer-events-none z-50 rounded-full"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: dotSize,
          height: dotSize,
          backgroundColor: isLink ? '#fff' : dotBgColor,
          transform: 'translate(-50%, -50%)',
          transition,
        }}
      />
    </>
  );
}
