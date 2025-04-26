import {Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import {type IndexLoader} from '~/routes/($locale)._index';
import {useState, useRef} from 'react';
import {useSpring, animated} from '@react-spring/web';

function aspectRatio(width: number, height: number) {
  return width / height;
}

export default function ProductGrid({
  products,
}: {
  products: Awaited<ReturnType<IndexLoader>>['products'];
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-auto gap-4 md:gap-10 place-items-center">
      {products.map((product: any, i: number) => {
        const isWideImage =
          aspectRatio(
            product.featuredImage?.width ?? 0,
            product.featuredImage?.height ?? 0,
          ) > 1;

        return (
          <div
            className={`relative h-auto md:h-auto col-span-2 ${isWideImage ? 'md:col-span-2' : 'md:col-span-1'}`}
            key={product.id}
          >
            <figure className=" w-full h-full m-0 relative">
              <Link to={`/products/${product.handle}`} prefetch="intent">
                {product.featuredImage && (
                  <Image
                    data={product.featuredImage}
                    loading="lazy"
                    className="max-w-full w-full max-h-full h-auto object-cover"
                  />
                )}
                <ParallaxCaption product={product} />
              </Link>
            </figure>
          </div>
        );
      })}
    </div>
  );
}

function ParallaxCaption({product}: {product: any}) {
  const [hovered, setHovered] = useState(false);
  const [coords, setCoords] = useState({x: 0, y: 0});
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    // Calculate center-relative coordinates (-1 to 1 range)
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setCoords({x, y});
  };

  // Spring for the caption
  const captionSpring = useSpring({
    opacity: hovered ? 1 : 0,
    transform: hovered
      ? `perspective(800px) rotateX(${-coords.y * 20}deg) rotateY(${coords.x * 20}deg) translateZ(30px)`
      : 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
    config: {mass: 1, tension: 280, friction: 60},
  });

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <animated.figcaption
        style={captionSpring}
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm p-4 rounded-lg shadow-lg min-w-72 max-w-2/5"
      >
        <h2 className="text-center text-balance font-display font-extralight text-white">
          {product.title}
        </h2>
        <ProductDescription description={product.description} />
        <Money
          className="w-fit mx-auto my-3 py-1 px-2 font-thin text-white bg-gray-500/80 rounded-md"
          data={product.priceRange.minVariantPrice}
        />
      </animated.figcaption>
    </div>
  );
}

function ProductDescription({description}: {description: string}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      <div
        className={`relative mx-auto overflow-hidden transition-all duration-500 ease-linear ${expanded ? 'max-h-72 overflow-scroll' : 'max-h-24'}`}
      >
        <p className="text-center text-pretty text-white/90">{description}</p>
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
      <button
        onClick={(e) => {
          e.preventDefault();
          setExpanded(!expanded);
        }}
        className="mt-3 px-4 py-1 text-xs uppercase tracking-wider font-medium bg-black/40 text-white/90 hover:bg-black/60 hover:text-white rounded-full border border-white/20 transition-all duration-200 backdrop-blur-sm block mx-auto cursor-none"
      >
        {expanded ? 'Show Less' : 'Read More'}
      </button>
    </div>
  );
}
