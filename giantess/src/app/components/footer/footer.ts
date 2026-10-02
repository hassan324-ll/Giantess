import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBarcode,
  faEnvelope,
  faGlobe,
  faHeadset,
  faLocationDot,
  faPaperPlane,
  faPhone,
  faShield,
  faTruck,
  faWrench,
} from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';

type FooterLink = {
  label: string;
  route: string;
  fragment?: string;
};

type ContactItem = {
  label: string;
  href: string;
  icon: IconDefinition;
};

type SocialItem = {
  label: string;
  href: string;
  icon: IconDefinition;
};

type SocialMediaItem = {
  label: string;
  href: string;
  icon: IconDefinition;
};

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [FontAwesomeModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  protected readonly logoPath = 'logo-header.png';
  protected readonly newsletterImagePath = 'product-item1.png';
  protected readonly faEnvelope = faEnvelope;
  protected readonly faPaperPlane = faPaperPlane;

  protected readonly companyLinks: FooterLink[] = [
    { label: 'About Us', route: '/about' },
    { label: 'Promotions', route: '/home', fragment: 'product-brands' },
    { label: 'Stores', route: '/contact', fragment: 'contact-details' },
    { label: 'Delivery & Return', route: '/contact', fragment: 'service-support' },
  ];

  protected readonly supportLinks: FooterLink[] = [
    { label: 'Help Center', route: '/home', fragment: 'faqs' },
    { label: 'Product Support', route: '/contact', fragment: 'service-support' },
    { label: 'Warranty Service', route: '/contact', fragment: 'service-support' },
    { label: 'Request a Quote', route: '/contact', fragment: 'contact-form' },
  ];

  protected readonly categoryLinks: FooterLink[] = [
    { label: 'Mobile Computers', route: '/home', fragment: 'category-mobile-computers' },
    { label: 'Barcode Scanners', route: '/home', fragment: 'category-barcode-scanners' },
    { label: 'Printers', route: '/home', fragment: 'category-printers' },
    { label: 'Accessories', route: '/home', fragment: 'category-accessories' },
  ];

  protected readonly contactItems: ContactItem[] = [
    { label: '+86 13142211581', href: 'tel:+86 13142211581 ', icon: faPhone },
    { label: 'info@giantess-cn.com', href: 'mailto:info@giantess-cn.com', icon: faEnvelope },
    { label: 'Worldwide shipping available', href: '/home', icon: faLocationDot },
  ];

  protected readonly socialItems: SocialItem[] = [
    { label: 'Catalog', href: '/home', icon: faBarcode },
    { label: 'Shipping', href: '/home', icon: faTruck },
    { label: 'Service', href: '/contact', icon: faWrench },
    { label: 'Warranty', href: '/contact', icon: faShield },
    { label: 'Global', href: '/home', icon: faGlobe },
  ];

  protected readonly socialMediaItems: SocialMediaItem[] = [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/company/giantess-barcode-solutions-co-ltd/',
      icon: faLinkedinIn,
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/giantess__barcode?igsh=aG5vbmR2dHBobXlp&utm_source=qr',
      icon: faInstagram,
    },
  ];

  protected readonly featureItems = [
    { label: '24H Support', icon: faHeadset },
    { label: 'Fast Shipping', icon: faTruck },
    { label: 'Secure Service', icon: faShield },
  ];

}
