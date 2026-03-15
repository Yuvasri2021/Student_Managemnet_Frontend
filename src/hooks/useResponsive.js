import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width <= 768;
  const isTablet = windowSize.width > 768 && windowSize.width <= 1024;
  const isDesktop = windowSize.width > 1024;

  // Responsive grid columns helper
  const getGridColumns = (desktop = 3, tablet = 2, mobile = 1) => {
    if (isMobile) return mobile;
    if (isTablet) return tablet;
    return desktop;
  };

  // Responsive padding helper
  const getPadding = (desktop = '24px', tablet = '20px', mobile = '16px') => {
    if (isMobile) return mobile;
    if (isTablet) return tablet;
    return desktop;
  };

  // Responsive font size helper
  const getFontSize = (desktop, tablet = desktop, mobile = desktop) => {
    if (isMobile) return mobile;
    if (isTablet) return tablet;
    return desktop;
  };

  return {
    isMobile,
    isTablet,
    isDesktop,
    windowSize,
    getGridColumns,
    getPadding,
    getFontSize,
  };
};
