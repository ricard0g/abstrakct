import {useEffect, useState} from 'react';

export default function Cursor() {
  const [position, setPosition] = useState({x: -100, y: -100});
  const [trailPositions, setTrailPositions] = useState<
    Array<{x: number; y: number}>
  >([]);
  const [isHovering, setIsHovering] = useState(false);
  const [currentHoverItem, setCurrentHoverItem] = useState<Element | null>(
    null,
  );

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
      setCurrentHoverItem(productItem as Element);
      
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
      setCurrentHoverItem(null);
      
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
    
    // Add styles for the hover effect
    const style = document.createElement('style');
    style.innerHTML = `
      .hover-scale {
        transform: scale(1.02);
        transition: transform 0.3s ease;
      }
      
      .grid > div {
        transition: transform 0.3s ease;
      }
      
      .grid > div figcaption {
        transition: opacity 0.3s ease, transform 0.3s ease;
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.95);
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 1rem;
        border-radius: 4px;
      }
    `;
    document.head.appendChild(style);
    
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
      
      // Clean up the style element
      document.head.removeChild(style);
    };
  }, []);

  // Update trail positions when main cursor position changes
  useEffect(() => {
    // Only start the trail once the cursor is on screen
    if (position.x === -100 && position.y === -100) return;

    // Add current position to the trail and limit to 5 positions
    setTrailPositions((prev) => {
      const newPositions = [position, ...prev];
      return newPositions.slice(0, 5);
    });
  }, [position]);

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
      {/* Main cursor elements */}
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

      {/* Trail elements */}
      {trailPositions.map((pos, index) => (
        <div
          key={index}
          className="fixed pointer-events-none z-40 rounded-full"
          style={{
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            width: `${4 - index * 0.7}px`,
            height: `${4 - index * 0.7}px`,
            backgroundColor: '#222',
            opacity: 0.3 - index * 0.05,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </>
  );
}

function eventDelegationHover(e: MouseEvent) {
  const grid = document.querySelector('.grid') as HTMLElement;

  grid.addEventListener('mouseover', (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    if (target.closest('.grid > div') || target.matches('.grid > div')) {
      target.classList.add('hover-scale');
    }
  });

  grid.addEventListener('mouseout', (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    if (target.closest('.grid > div') || target.matches('.grid > div')) {
      target.classList.remove('hover-scale');
    }
  });
}