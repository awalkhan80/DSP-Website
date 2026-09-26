import React from 'react';

interface WhatsAppLogoProps {
  className?: string;
  size?: number;
}

/**
 * Authentic WhatsApp rounded square green logo matching the user-uploaded graphic:
 * Bright green rounded squircle (#25D366) with clean white speech bubble and phone handset.
 */
export const WhatsAppLogo: React.FC<WhatsAppLogoProps> = ({ className = 'w-5 h-5', size }) => {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      {/* WhatsApp Green Rounded Squircle Background */}
      <rect width="512" height="512" rx="128" fill="#25D366" />
      
      {/* Outer White Chat Bubble Contour */}
      <path
        d="M256 100C170.4 100 101 169.4 101 255C101 285.4 109.8 313.7 125 337.6L103 417L185.2 395.4C207.2 407.4 230.8 414 256 414C341.6 414 411 344.6 411 259C411 173.4 341.6 100 256 100ZM256 385C233.8 385 212.7 379 194.5 367.9L189.9 365.1L138.8 378.5L152.5 328.7L149.4 323.7C136.9 303.8 129.5 280.2 129.5 255C129.5 185.2 186.2 128.5 256 128.5C325.8 128.5 382.5 185.2 382.5 255C382.5 324.8 325.8 385 256 385Z"
        fill="white"
      />
      
      {/* Inner White Handset Icon */}
      <path
        d="M333.6 295.6C329.4 293.5 308.8 283.4 305 282C301.2 280.6 298.4 279.9 295.6 284.1C292.8 288.3 285 298.1 282.6 300.9C280.2 303.7 277.8 304.1 273.6 302C269.4 299.9 255.8 295.4 239.7 281.1C227.1 269.9 218.6 256 216.2 251.8C213.8 247.6 215.9 245.3 218 243.2C219.9 241.3 222.2 238.3 224.3 235.9C226.4 233.5 227.1 231.7 228.5 228.9C229.9 226.1 229.2 223.7 228.2 221.6C227.2 219.5 218.8 198.8 215.3 190.4C211.9 182.2 208.4 183.3 205.8 183.2C203.4 183.1 200.6 183.1 197.8 183.1C195 183.1 190.5 184.2 186.6 188.4C182.8 192.6 172 202.7 172 223.3C172 243.9 187 263.8 189.1 266.6C191.2 269.4 218.6 311.6 260.6 329.7C270.6 334 278.4 336.6 284.5 338.5C294.6 341.7 303.8 341.3 311 340.2C319.1 339 335.8 330.1 339.3 320.3C342.8 310.5 342.8 302.1 341.8 300.3C340.7 298.5 337.8 297.7 333.6 295.6Z"
        fill="white"
      />
    </svg>
  );
};
