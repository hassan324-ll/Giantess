import { Component, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMinus, faPlus, faQuestion } from '@fortawesome/free-solid-svg-icons';

type FaqItem = {
  question: string;
  answer: string;
};

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './faqs.html',
  styleUrl: './faqs.css',
})
export class Faqs {
  protected readonly openIndex = signal(0);
  protected readonly faPlus = faPlus;
  protected readonly faMinus = faMinus;
  protected readonly faQuestion = faQuestion;

  protected readonly faqs: FaqItem[] = [
    {
      question: 'Can I place an order directly on the website?',
      answer:
        'No. GIANTESS is a B2B information and inquiry website. You can review product details, then send us your requirements so our team can confirm availability, compatibility, quantity, and quotation details.',
    },
    {
      question: 'Do you show fixed prices or accept online payment?',
      answer:
        'We do not process online payments on the website. Pricing depends on product type, quantity, destination, sourcing status, and business requirements, so quotations are handled through direct B2B communication.',
    },
    {
      question: 'What information should I include in an inquiry?',
      answer:
        'Please share the brand, model, part number, required quantity, destination country, and any photos or compatibility notes you have. This helps us respond faster with practical sourcing information.',
    },
    {
      question: 'Do you support repair centers, distributors, and resellers?',
      answer:
        'Yes. We work with repair centers, refurbishers, distributors, resellers, and business buyers who need barcode spare parts, rugged device accessories, and long-term supply support.',
    },
    {
      question: 'Can you help if I cannot find the exact product online?',
      answer:
        'Yes. Send the device model, part name, part number, or a photo through the contact form. Our team can check availability or suggest compatible replacement options where possible.',
    },
  ];

  protected toggleFaq(index: number): void {
    this.openIndex.set(this.openIndex() === index ? -1 : index);
  }
}
