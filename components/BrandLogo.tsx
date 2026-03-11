import React from 'react';

interface BrandLogoProps {
  className?: string;
  alt?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'h-12 w-12',
  alt = 'W4U logo'
}) => {
  return (
    <img
      src={`${import.meta.env.BASE_URL}w4u-logo.svg`}
      alt={alt}
      className={className}
    />
  );
};

export default BrandLogo;
