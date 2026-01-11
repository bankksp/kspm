
import React from 'react';

const SchoolLogo: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => {
  const logoUrl = 'https://img5.pic.in.th/file/secure-sv1/channels4_profile-removebg-preview7cd6988ae46998a7.png';
  return <img src={logoUrl} alt="โลโก้โรงเรียนกาฬสินธุ์ปัญญานุกูล" {...props} />;
};

export default SchoolLogo;
