import {Link} from '@remix-run/react';
import {Image, Money, Pagination} from '@shopify/hydrogen';
import {useState, useRef, useEffect, useMemo, useCallback} from 'react';
import {useSpring, animated} from '@react-spring/web';
import {aspectRatio} from '~/lib/utils/utils';
import Spinner from './Spinner';

export default function ProductGrid<NodesType>({
  connection,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-auto gap-4 md:gap-10 place-items-center">
            <PreviousLink className="flex justify-center items-center col-span-3 w-full">
              {isLoading ? (
                'Loading...'
              ) : (
                <span className="bg-black/50 text-white px-4 py-2 rounded-md">
                  ↑ Load previous
                </span>
              )}
            </PreviousLink>
            {nodes.map((node, index) => (
              <ProductItem key={index} product={node} />
            ))}
            <NextLink className="flex justify-center items-center col-span-3 w-full">
              {isLoading ? (
                'Loading...'
              ) : (
                <span className="bg-black/50 text-white px-4 py-2 rounded-md">
                  Load more ↓
                </span>
              )}
            </NextLink>
          </div>
        );
      }}
    </Pagination>
  );
}

function ProductItem({product}: {product: any}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // Check if image is already cached
    if (imageRef.current && imageRef.current.complete) {
      setImageLoaded(true);
    }
  }, []);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const isWideImage = useMemo(
    () =>
      aspectRatio(
        product.featuredImage?.width ?? 0,
        product.featuredImage?.height ?? 0,
      ) > 1,
    [product.featuredImage],
  );

  return (
    <animated.div
      className={`relative min-h-[25vh] h-auto md:h-auto col-span-2 hover:border-[1px] rounded-lg hover:border-gray-200 ${
        isWideImage ? 'md:col-span-2' : 'md:col-span-1'
      }`}
    >
      <figure className="relative w-full h-full m-0">
        <Link to={`/products/${product.handle}`}>
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
              <Spinner
                size={40}
                color="#000000"
                secondaryColor="#e5e5e5"
                thickness={3}
              />
            </div>
          )}
          {product.featuredImage && (
            <Image
              ref={imageRef}
              data={product.featuredImage}
              loading="lazy"
              onLoad={handleImageLoad}
              className={`max-w-full w-full max-h-full h-auto rounded-lg object-cover transition-opacity duration-500`}
            />
          )}
          <ParallaxCaption product={product} />
        </Link>
      </figure>
    </animated.div>
  );
}

function ParallaxCaption({product}: {product: any}) {
  const [hovered, setHovered] = useState(false);
  const [mobileVisible, setMobileVisible] = useState(false);
  const [coords, setCoords] = useState({x: 0, y: 0});
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // const {type} = useAside();
  // console.log(type);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || isMobile) return;

      const rect = containerRef.current.getBoundingClientRect();
      // Calculate center-relative coordinates (-1 to 1 range)
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      setCoords({x, y});
    },
    [isMobile],
  );

  // Desktop spring with parallax effect
  const desktopCaptionSpring = useSpring({
    opacity: hovered ? 1 : 0,
    transform: hovered
      ? `perspective(800px) rotateX(${-coords.y * 20}deg) rotateY(${coords.x * 20}deg) translateZ(50px)`
      : 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
    config: {mass: 1, tension: 280, friction: 60},
  });

  // Mobile spring without parallax effect - just fade in/out
  const mobileCaptionSpring = useSpring({
    opacity: mobileVisible ? 1 : 0,
    config: {mass: 1, tension: 280, friction: 60},
  });

  const toggleMobileCaption = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setMobileVisible(!mobileVisible);
    },
    [mobileVisible],
  );

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 hover:rounded-lg rounded-lg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Desktop caption with parallax effect */}
      <animated.figcaption
        style={desktopCaptionSpring}
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm p-4 rounded-lg shadow-lg min-w-72 max-w-2/5 md:block hidden"
      >
        <h2 className="text-center text-balance font-display font-bold text-white">
          {product.title}
        </h2>
        <ProductDescription
          isMobile={isMobile}
          description={product.description}
        />
        <Money
          className="w-fit mx-auto my-3 py-1 px-2 font-thin text-white bg-gray-500/80 rounded-md"
          data={product.priceRange.minVariantPrice}
        />
      </animated.figcaption>

      {/* Mobile caption without parallax effect */}
      <animated.figcaption
        style={mobileCaptionSpring}
        className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm pt-10 md:pt-0 p-4 rounded-lg shadow-lg w-full md:min-w-72 md:max-w-2/5 md:hidden block ${mobileVisible ? 'z-20' : 'z-10'}`}
      >
        <button
          onClick={toggleMobileCaption}
          className="absolute bg-black/35 rounded-full p-1 top-3 right-3"
        >
          <svg
            width="20px"
            height="20px"
            viewBox="-0.5 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="#ffffff"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {' '}
              <path
                d="M3 21.32L21 3.32001"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>{' '}
              <path
                d="M3 3.32001L21 21.32"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>{' '}
            </g>
          </svg>
        </button>
        <h2 className="text-center text-balance font-playfair font-normal text-white">
          {product.title}
        </h2>
        <ProductDescription
          isMobile={isMobile}
          description={product.description}
        />
        <Money
          className="w-fit mx-auto my-3 py-1 px-2 font-thin text-white bg-gray-500/80 rounded-md"
          data={product.priceRange.minVariantPrice}
        />
      </animated.figcaption>

      {/* Mobile-only button to show caption */}
      <button
        onClick={toggleMobileCaption}
        className={`md:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-1 text-xs uppercase tracking-wider font-medium bg-black/40 text-white/90 hover:bg-black/60 hover:text-white rounded-full border border-white/20 transition-all duration-200 backdrop-blur-sm ${mobileVisible ? 'z-0' : 'z-10'}`}
      >
        {mobileVisible ? 'Hide Details' : 'Show Details'}
      </button>
    </div>
  );
}

function ProductDescription({
  description,
  isMobile,
}: {
  description: string;
  isMobile: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      <div
        className={`relative mx-auto transition-all duration-500 ease-linear overflow-scroll md:overflow-hidden ${expanded ? 'max-h-72 overflow-scroll' : 'max-h-24'}`}
      >
        <p className="text-base text-center text-pretty text-white/90">
          {description}
        </p>
        {!expanded && (
          <div
            className="absolute inset-0 mask-luminance"
            style={{
              maskImage:
                'linear-gradient(to bottom, transparent 100%, black 50%)',
            }}
          ></div>
        )}
      </div>
      {!isMobile && (
        <button
          onClick={(e) => {
            e.preventDefault();
            setExpanded(!expanded);
          }}
          className="mt-3 px-4 py-1 text-xs uppercase tracking-wider font-medium bg-black/40 text-white/90 hover:bg-black/60 hover:text-white rounded-full border border-white/20 transition-all duration-200 backdrop-blur-sm block mx-auto cursor-none"
        >
          {expanded ? 'Show Less' : 'Read More'}
        </button>
      )}
    </div>
  );
}
