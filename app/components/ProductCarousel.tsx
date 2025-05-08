import {EmblaCarouselType} from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import {memo, useCallback, useEffect, useState} from 'react';
import {ProductRecommendationsQuery} from 'storefrontapi.generated';
import {Image, Money} from '@shopify/hydrogen';
import {Link} from '@remix-run/react';

export const ProductCarousel = memo(function ProductCarousel({
  products,
}: {
  products: ProductRecommendationsQuery['productRecommendations'];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: true,
    breakpoints: {
      '(max-width: 768px)': {
        align: 'start',
      },
    },
  });
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const onScroll = useCallback((emblaApi: EmblaCarouselType) => {
    const progress = Math.max(0, Math.min(1, emblaApi?.scrollProgress() || 0));
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onScroll(emblaApi);
    emblaApi
      .on('reInit', onScroll)
      .on('scroll', onScroll)
      .on('slideFocus', onScroll);

    return () => {
      emblaApi.off('reInit', onScroll);
      emblaApi.off('scroll', onScroll);
      emblaApi.off('slideFocus', onScroll);
    };
  }, [emblaApi, onScroll]);

  return (
    <div className="w-full">
      <div className="embla__progress">
        <div
          className="embla__progress__bar"
          style={{transform: `translate3d(${scrollProgress * 100}%, 0, 0)`}}
        ></div>
      </div>
      <div ref={emblaRef} className="embla">
        <ul className="embla__container">
          {products?.map((product) => (
            <li
              className="embla__slide group scale-95 hover:scale-100 transition-all duration-300 mr-10"
              key={product.id}
            >
              <figure className="relative flex flex-col items-center justify-center w-full max-w-full max-h-full h-full">
                <div className="absolute top-4 right-4 md:top-8 md:right-8 flex group-hover:flex transition-all duration-300 items-center justify-center overflow-hidden">
                  <svg
                    className="relative bottom-0 md:translate-y-full group-hover:translate-y-0 transition-all duration-300"
                    fill="#52525c"
                    width="30px"
                    height="30px"
                    viewBox="0 0 64 64"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    xmlSpace="preserve"
                    style={{
                      fillRule: 'evenodd',
                      clipRule: 'evenodd',
                      strokeLinejoin: 'round',
                      strokeMiterlimit: '2',
                    }}
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {' '}
                      <rect
                        id="Icons"
                        x="-896"
                        y="0"
                        width="1280"
                        height="800"
                        style={{fill: 'none'}}
                      ></rect>{' '}
                      <g id="Icons1">
                        {' '}
                        <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g>{' '}
                        <g id="H3"> </g> <g id="list-ul"> </g>{' '}
                        <g id="hamburger-1"> </g> <g id="hamburger-2"> </g>{' '}
                        <g id="list-ol"> </g> <g id="list-task"> </g>{' '}
                        <g id="trash"> </g> <g id="vertical-menu"> </g>{' '}
                        <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g>{' '}
                        <g id="Pen"> </g> <g id="Pen1"> </g> <g id="clock"> </g>{' '}
                        <g id="external-link">
                          {' '}
                          <path d="M36.026,20.058l-21.092,0c-1.65,0 -2.989,1.339 -2.989,2.989l0,25.964c0,1.65 1.339,2.989 2.989,2.989l26.024,0c1.65,0 2.989,-1.339 2.989,-2.989l0,-20.953l3.999,0l0,21.948c0,3.308 -2.686,5.994 -5.995,5.995l-28.01,0c-3.309,0 -5.995,-2.687 -5.995,-5.995l0,-27.954c0,-3.309 2.686,-5.995 5.995,-5.995l22.085,0l0,4.001Z"></path>{' '}
                          <path d="M55.925,25.32l-4.005,0l0,-10.481l-27.894,27.893l-2.832,-2.832l27.895,-27.895l-10.484,0l0,-4.005l17.318,0l0.002,0.001l0,17.319Z"></path>{' '}
                        </g>{' '}
                        <g id="hr"> </g> <g id="info"> </g>{' '}
                        <g id="warning"> </g> <g id="plus-circle"> </g>{' '}
                        <g id="minus-circle"> </g> <g id="vue"> </g>{' '}
                        <g id="cog"> </g> <g id="logo"> </g>{' '}
                        <g id="radio-check"> </g> <g id="eye-slash"> </g>{' '}
                        <g id="eye"> </g> <g id="toggle-off"> </g>{' '}
                        <g id="shredder"> </g>{' '}
                        <g id="spinner--loading--dots-"> </g>{' '}
                        <g id="react"> </g> <g id="check-selected"> </g>{' '}
                        <g id="turn-off"> </g> <g id="code-block"> </g>{' '}
                        <g id="user"> </g> <g id="coffee-bean"> </g>{' '}
                        <g id="coffee-beans">
                          {' '}
                          <g id="coffee-bean1"> </g>{' '}
                        </g>{' '}
                        <g id="coffee-bean-filled"> </g>{' '}
                        <g id="coffee-beans-filled">
                          {' '}
                          <g id="coffee-bean2"> </g>{' '}
                        </g>{' '}
                        <g id="clipboard"> </g> <g id="clipboard-paste"> </g>{' '}
                        <g id="clipboard-copy"> </g> <g id="Layer1"> </g>{' '}
                      </g>{' '}
                    </g>
                  </svg>
                </div>
                <Link
                  className="w-full max-h-full h-10/12"
                  to={`/products/${product.handle}`}
                >
                  <Image
                    src={product.images.nodes[0].url}
                    alt={product.title}
                    className="w-full max-h-full h-full object-contain cursor-grab"
                  />
                </Link>
                <figcaption className="relative w-full flex items-end justify-between overflow-hidden">
                  <h3 className="relative bottom-0 left-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 max-w-1/2 text-base md:text-xl text-pretty text-zinc-600 font-medium">
                    {product.title}
                  </h3>
                  <Money
                    className="relative bottom-0 left-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform delay-150 duration-300 text-base md:text-xl text-zinc-600 font-medium"
                    data={product.priceRange.minVariantPrice}
                  />
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});