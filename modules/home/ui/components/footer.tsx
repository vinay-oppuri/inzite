import Link from 'next/link';
import React from 'react';

const Footer = () => {
  return (
    <footer className="flex justify-between items-center text-muted-foreground text-xs md:text-base w-full p-4 border-t border-border/40 bg-background/60 backdrop-blur-xl relative overflow-hidden">
      <p>&copy; {new Date().getFullYear()} Inzite AI. All rights reserved.</p>
      <div className="flex flex-col md:flex-row gap-2 md:gap-8">
        <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
        <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
      </div>
    </footer>
  );
};

export default Footer;