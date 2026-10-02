import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBarcode,
  faBoxesStacked,
  faGlobe,
  faHandshake,
  faIndustry,
  faMicrochip,
  faMobileScreenButton,
  faScrewdriverWrench,
} from '@fortawesome/free-solid-svg-icons';

type BusinessScopeCard = {
  title: string;
  eyebrow: string;
  description: string;
  tags: string[];
  icon: IconDefinition;
};

@Component({
  selector: 'app-business-scope',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './business-scope.html',
  styleUrl: './business-scope.css',
})
export class BusinessScope {
  protected readonly scopeCards: BusinessScopeCard[] = [
    {
      title: 'Genuine & Compatible Parts',
      eyebrow: 'Spare Parts',
      description:
        'We supply genuine, compatible, and replacement parts for barcode terminals, scanners, printers, and rugged mobile devices.',
      tags: ['Touch Screens', 'Batteries'],
      icon: faBarcode,
    },
    {
      title: 'Global Trade',
      eyebrow: 'Worldwide Supply',
      description:
        'GIANTESS supports B2B supply with cross-border shipping, channel distribution, procurement coordination, and delivery.',
      tags: ['B2B', 'Export'],
      icon: faGlobe,
    },
    {
      title: 'Repair & Refurbishment',
      eyebrow: 'Device Service',
      description:
        'We help extend device life cycles by supplying the parts needed for repair, refurbishment, maintenance, and replacement.',
      tags: ['Repair', 'Maintenance'],
      icon: faScrewdriverWrench,
    },
    {
      title: 'Exclusive Agent for ZENOVA',
      eyebrow: 'Partner Network',
      description:
        'As an authorized partner for ZENOVA and selected product lines, we support global distributors and business buyers.',
      tags: ['ZENOVA', 'Agent'],
      icon: faHandshake,
    },
    {
      title: 'Barcode Equipment & Terminals',
      eyebrow: 'Hardware Sourcing',
      description:
        'In addition to spare parts, we support sourcing for barcode scanners, mobile computers, printers, RFID readers, and terminals.',
      tags: ['Scanners', 'Printers'],
      icon: faMobileScreenButton,
    },
    {
      title: 'Customized OEM & ODM',
      eyebrow: 'Custom Supply',
      description:
        'We provide flexible OEM and ODM support for device accessories and selected components, including branding and packaging.',
      tags: ['OEM', 'ODM'],
      icon: faIndustry,
    },
  ];

  protected readonly sectionIcon = faBoxesStacked;
  protected readonly watermarkIcon = faMicrochip;
}
