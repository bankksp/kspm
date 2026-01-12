
import React from 'react';

const SchoolLogo: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => {
  const logoUrl = 'https://img5.pic.in.th/file/secure-sv1/-300x30052b1d65e147cbf32.png';
  return <img src={logoUrl} alt="โลโก้โรงเรียนกาฬสินธุ์ปัญญานุกูล" {...props} />;
};

export default SchoolLogo;
