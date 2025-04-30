import {Link, useNavigation} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import {type IndexLoader} from '~/routes/($locale)._index';
import {useState, useRef, useEffect} from 'react';
import {useSpring, animated, useInView, easings} from '@react-spring/web';

function aspectRatio(width: number, height: number) {
  return width / height;
}

export default function ProductGrid({
  products,
}: {
  products: Awaited<ReturnType<IndexLoader>>['products'];
}) {
  const navigation = useNavigation();

  return (
    <div
      className={
        navigation.state === 'loading'
          ? 'loading'
          : 'grid grid-cols-2 md:grid-cols-3 auto-rows-auto gap-4 md:gap-10 place-items-center'
      } /*className="grid grid-cols-2 md:grid-cols-3 auto-rows-auto gap-4 md:gap-10 place-items-center"*/
    >
      {products.map((product: any, i: number) => {
        return <ProductItem key={product.id} product={product} />;
      })}
    </div>
  );
}

function ProductItem({product, key}: {product: any; key: string}) {
  const [inViewRef, springs] = useInView(
    () => ({
      from: {
        opacity: 0,
        scale: 0.9,
        y: 20,
      },
      to: {
        opacity: 1,
        scale: 1,
        y: 0,
      },
      delay: 500,
      config: {
        mass: 2,
        tension: 120,
        friction: 14,
        easing: easings.easeInOutExpo,
      },
    }),
    {
      amount: 0.4,
      once: true,
    },
  );
  const isWideImage =
    aspectRatio(
      product.featuredImage?.width ?? 0,
      product.featuredImage?.height ?? 0,
    ) > 1;
  return (
    <animated.div
      ref={inViewRef}
      style={springs}
      className={`relative h-auto md:h-auto col-span-2 hover:border-[1px] rounded-lg hover:border-gray-200 ${
        isWideImage ? 'md:col-span-2' : 'md:col-span-1'
      }`}
      key={key}
    >
      <figure className=" w-full h-full m-0 relative">
        <Link to={`/products/${product.handle}`} prefetch="intent">
          {product.featuredImage && (
            <Image
              data={product.featuredImage}
              loading="lazy"
              className="max-w-full w-full max-h-full h-auto rounded-lg object-cover"
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isMobile) return;

    const rect = containerRef.current.getBoundingClientRect();
    // Calculate center-relative coordinates (-1 to 1 range)
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setCoords({x, y});
  };

  // Desktop spring with parallax effect
  const desktopCaptionSpring = useSpring({
    opacity: hovered ? 1 : 0,
    transform: hovered
      ? `perspective(800px) rotateX(${-coords.y * 20}deg) rotateY(${coords.x * 20}deg) translateZ(30px)`
      : 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
    config: {mass: 1, tension: 280, friction: 60},
  });

  // Mobile spring without parallax effect - just fade in/out
  const mobileCaptionSpring = useSpring({
    opacity: mobileVisible ? 1 : 0,
    config: {mass: 1, tension: 280, friction: 60},
  });

  const toggleMobileCaption = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileVisible(!mobileVisible);
  };

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
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm p-4 rounded-lg shadow-lg min-w-72 max-w-2/5 md:block hidden z-10"
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
