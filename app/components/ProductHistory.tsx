import {memo, useMemo} from 'react';
import {useResponsive} from '~/lib/hooks/useResponsive';
import {ProductCopy} from '~/lib/types/productTypes';
import {Parallax, ParallaxLayer} from '@react-spring/parallax';
import {Image, Video} from '@shopify/hydrogen';

export const ProductHistory = memo(function ProductHistory({
  productCopy,
}: {
  productCopy: ProductCopy | null;
}) {
  const {isMobile} = useResponsive();

  const headingText = useMemo(
    () => productCopy?.['history-section']?.['heading'] || '',
    [productCopy],
  );

  const firstBlockText = useMemo(
    () => productCopy?.['history-section']['first-block']['text-block'] || '',
    [productCopy],
  );

  const secondBlockText = useMemo(
    () => productCopy?.['history-section']['second-block']['text-block'] || '',
    [productCopy],
  );

  const thirdBlockText = useMemo(
    () => productCopy?.['history-section']['third-block']['text-block'] || '',
    [productCopy],
  );

  const totalPages = isMobile ? 7 : 4;

  return (
    <section className="relative max-h-[90%] h-[70vh] md:h-[80vh]">
      {/* Parallax History Section */}
      <section className="block w-full md:w-11/12 mx-auto h-[85vh] top-0 mt-10 z-[2]">
        <Parallax
          key={isMobile ? 'mobile' : 'desktop'}
          pages={totalPages}
          className="absolute top-0 left-0 w-full h-full bg-zinc-900 border-[1px] border-zinc-700 rounded-lg overflow-hidden [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-gray-500 [&::-webkit-scrollbar-thumb:hover]:bg-zinc-400 scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-500"
          style={{
            backgroundColor: '#18181b',
            opacity: 1,
            backgroundImage:
              'radial-gradient(#373737 0.9500000000000001px, transparent 0.9500000000000001px), radial-gradient(#373737 0.9500000000000001px, #18181b 0.9500000000000001px)',
            backgroundSize: '38px 38px',
            backgroundPosition: '0 0, 19px 19px',
          }}
        >
          {/* Heading - Section 1 */}
          <ParallaxLayer
            offset={0}
            speed={isMobile ? 0.2 : 0.1}
            factor={1}
            className="flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-y-10 justify-center max-w-full md:max-w-[70%] w-full h-full px-2 md:px-5 py-5">
              <h2 className="text-5xl md:text-7xl font-display tracking-tight text-center mb-12 text-gray-100 overflow-hidden">
                {headingText}
              </h2>
              <p className="flex flex-col items-center gap-x-2 text-gray-100 text-base md:text-2xl tracking-wide text-center ">
                <span className="inline-block">Scroll</span>
                <span className="inline-block">
                  <svg
                    width="20px"
                    height="20px"
                    viewBox="0 0 1024 1024"
                    className="icon"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#ffffff"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <path
                        d="M903.232 256l56.768 50.432L512 768 64 306.432 120.768 256 512 659.072z"
                        fill="#fff"
                      ></path>
                    </g>
                  </svg>
                </span>
              </p>
            </div>
          </ParallaxLayer>

          {/* First Block - Section 2 */}
          <ParallaxLayer
            offset={isMobile ? 2 : 1}
            speed={isMobile ? 0.3 : 0.1}
            factor={1}
            className="flex items-center justify-center md:justify-start px-5 md:px-20"
          >
            <div className="flex flex-col items-center justify-center max-w-full md:max-w-1/3 w-full h-full">
              <h3 className="w-full text-4xl md:text-6xl font-display text-left tracking-tighter mb-10 pb-2 overflow-hidden text-gray-200">
                History
              </h3>
              <p className="text-xl md:text-2xl tracking-wide leading-loose md:leading-relaxed text-pretty overflow-hidden text-gray-300">
                {firstBlockText}
              </p>
            </div>
          </ParallaxLayer>

          <ParallaxLayer
            offset={isMobile ? 1 : 1}
            speed={isMobile ? 0.4 : 0.7}
            factor={isMobile ? 1.5 : 1}
            className="flex items-center justify-center md:justify-end px-2 md:px-20"
          >
            <div className="flex flex-col items-center justify-center max-w-full w-full md:max-w-7/12 md:w-6/12 max-h-[600px] md:max-h-[700px] h-full">
              <Image
                src={
                  productCopy?.['history-section']['first-block']['image_url']
                }
                alt="Product Image"
                loading="lazy"
                className="max-w-full w-full max-h-full h-full object-cover rounded-lg"
              />
            </div>
          </ParallaxLayer>

          {/* Second Block - Section 3 */}
          <ParallaxLayer
            offset={isMobile ? 4 : 2}
            speed={0.1}
            factor={1}
            className="flex items-center justify-center md:justify-end px-5 md:px-20"
          >
            <div className="flex flex-col items-center justify-center max-w-full md:max-w-1/3 w-full h-full">
              <h3 className="w-full text-4xl md:text-6xl font-display text-left tracking-tighter mb-10 pb-2 overflow-hidden text-gray-200">
                The Process
              </h3>
              <p className="text-xl md:text-2xl tracking-wide leading-loose md:leading-relaxed text-pretty overflow-hidden text-gray-300">
                {secondBlockText}
              </p>
            </div>
          </ParallaxLayer>

          <ParallaxLayer
            offset={isMobile ? 3 : 2}
            speed={0.7}
            factor={isMobile ? 1.5 : 1}
            className="flex items-center justify-center md:justify-start px-2 md:px-20"
          >
            <div className="flex flex-col items-center justify-center max-w-full w-full md:max-w-7/12 md:w-6/12 max-h-[600px] md:max-h-[700px] h-full">
              <Video
                data={{
                  sources: [
                    {
                      url:
                        productCopy?.['history-section']['second-block'][
                          'image_url'
                        ] || '',
                      mimeType: 'video/mp4',
                    },
                  ],
                }}
                controls={false}
                autoPlay={true}
                muted={true}
                loop={true}
                className="max-w-full w-full max-h-full h-full object-cover rounded-lg"
              />
            </div>
          </ParallaxLayer>

          {/* Third Block - Section 4 */}
          <ParallaxLayer
            offset={isMobile ? 6 : 3}
            speed={0.1}
            factor={1}
            className="flex items-center justify-center md:justify-start px-5 md:px-20"
          >
            <div className="flex flex-col items-center justify-center max-w-full md:max-w-1/3 w-full h-full">
              <h3 className="w-full text-4xl md:text-6xl font-display text-left tracking-tighter mb-10 pb-2 overflow-hidden text-gray-200">
                More History
              </h3>
              <p className="text-xl md:text-2xl tracking-wide leading-loose md:leading-relaxed text-pretty overflow-hidden text-gray-300">
                {thirdBlockText}
              </p>
            </div>
          </ParallaxLayer>

          <ParallaxLayer
            offset={isMobile ? 5 : 3}
            speed={0.7}
            factor={isMobile ? 1.5 : 1}
            className="flex items-center justify-center md:justify-end px-2 md:px-20"
          >
            <div className="flex flex-col items-center justify-center max-w-full w-full md:max-w-7/12 md:w-6/12 max-h-[600px] md:max-h-[700px] h-full">
              <Image
                src={
                  productCopy?.['history-section']['third-block']['image_url']
                }
                loading="lazy"
                alt="Product Image"
                className="max-w-full w-full max-h-full h-full object-cover rounded-4xl"
              />
            </div>
          </ParallaxLayer>
        </Parallax>
      </section>
    </section>
  );
});
