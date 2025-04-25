import {useEffect, useState} from 'react';

export default function Cursor() {
  const [position, setPosition] = useState({x: -100, y: -100});
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setPosition({x: e.clientX, y: e.clientY});
    };

    // Event delegation handlers
    const handleMouseOver = (e: Event) => {
      const target = e.target as HTMLElement;
      const productItem = target.closest('.grid > div');

      if (!productItem) return;

      setIsHovering(true);

      // Add scale effect
      productItem.classList.add('hover-scale');

      // Show the figcaption
      const figcaption = productItem.querySelector('figcaption');
      if (figcaption instanceof HTMLElement) {
        figcaption.style.opacity = '1';
        figcaption.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    };

    const handleMouseOut = (e: Event) => {
      const target = e.target as HTMLElement;
      const productItem = target.closest('.grid > div');

      if (!productItem) return;

      setIsHovering(false);

      // Remove scale effect
      productItem.classList.remove('hover-scale');

      // Hide the figcaption
      const figcaption = productItem.querySelector('figcaption');
      if (figcaption instanceof HTMLElement) {
        figcaption.style.opacity = '0';
        figcaption.style.transform = 'translate(-50%, -50%) scale(0.95)';
      }
    };

    // Find the grid parent element
    const grid = document.querySelector('.grid');

    // Add event listeners to the grid container using delegation
    if (grid) {
      grid.addEventListener('mouseover', handleMouseOver);
      grid.addEventListener('mouseout', handleMouseOut);
    }

    window.addEventListener('mousemove', moveCursor);

    return () => {
      window.removeEventListener('mousemove', moveCursor);

      // Cleanup event listeners from grid
      if (grid) {
        grid.removeEventListener('mouseover', handleMouseOver);
        grid.removeEventListener('mouseout', handleMouseOut);
      }
    };
  }, []);

  // Dynamic cursor styles based on hovering state
  const ringSize = isHovering ? '80px' : '40px';
  const dotSize = isHovering ? '8px' : '5px';
  const ringBgColor = isHovering
    ? 'rgba(10, 10, 10, 0.2)'
    : 'rgba(20, 20, 20, 0.1)';
  const dotBgColor = isHovering ? '#111' : '#333';
  const ringBorderColor = isHovering ? '#333' : '#222';
  const transition =
    'width 0.3s ease, height 0.3s ease, background-color 0.3s ease';

  return (
    <>
      <div
        className="fixed pointer-events-none z-50 rounded-full border mix-blend-difference"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: ringSize,
          height: ringSize,
          backgroundColor: ringBgColor,
          borderColor: ringBorderColor,
          transform: 'translate(-50%, -50%)',
          transition,
        }}
      />

      <div
        className="fixed pointer-events-none z-50 rounded-full"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: dotSize,
          height: dotSize,
          backgroundColor: dotBgColor,
          transform: 'translate(-50%, -50%)',
          transition,
        }}
      />
    </>
  );
}
