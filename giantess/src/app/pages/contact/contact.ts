import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Banner } from '../../components/banner/banner';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ContactPayload, ContactService } from '../../services/contact.service';
import {
  faBriefcase,
  faEnvelope,
  faGlobe,
  faLocationDot,
  faMessage,
  faPhone,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

type AccountManager = {
  name: string;
  jobTitle: string;
  email: string;
  responsibility: string;
  region: string;
};

@Component({
  selector: 'app-contact',
  imports: [Banner, FontAwesomeModule, ReactiveFormsModule, RouterLink],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  protected readonly faUser = faUser;
  protected readonly faBriefcase = faBriefcase;
  protected readonly faEnvelope = faEnvelope;
  protected readonly faGlobe = faGlobe;
  protected readonly faPhone = faPhone;
  protected readonly faMessage = faMessage;
  protected readonly faLocationDot = faLocationDot;

  protected readonly accountManagers: AccountManager[] = [
    {
      name: 'Jasmine Xu',
      jobTitle: 'General Manager',
      email: 'jasmine@giantess-cn.com',
      responsibility: 'Overall business strategy, global partnerships, key account development, and international market expansion.',
      region: 'Global markets',
    },
     {
      name: 'Leo Lee',
      jobTitle: 'Overseas Sales Manager',
      email: 'leo@giantess-cn.com',
      responsibility: 'Leading main market development, distributor management, and strategic account growth.',
      region: 'Global markets',
    },
     {
      name: 'Harry Ou',
      jobTitle: 'Regional Sales Manager',
      email: 'harry@giantess-cn.com',
      responsibility: 'Customer development and channel partnerships.',
      region: 'DACH Region，Portuguese-speaking Markets, UK& Ireland',
    },
     {
      name: 'Arielle Xu',
      jobTitle: 'Region Business Development Manager',
      email: 'arielle@giantess-cn.com',
      responsibility: 'Customer development and channel partnerships.',
      region: 'Francophone Markets, Spanish-speaking Markets，Italian-speaking Markets',
    },

     {
      name: 'Ryan Cheng',
      jobTitle: 'Regional Opeartion Manager',
      email: 'ryan@giantess-cn.com',
      responsibility: 'Develop and maintain corporate clients, repair centers, refurbishers, and distribution partners in Hong Kong, Macau, and Taiwan.',
      region: ' Hong Kong / Macau / Taiwan',
    },
     {
      name: 'Adrian Chen',
      jobTitle: 'Operations & Customer Success Manager',
      email: 'adrian@giantess-cn.com',
      responsibility: 'Develop and maintain corporate clients, repair centers, distributors, and system integrators in Arabic Area and Africa',
      region: 'Arabic-speaking Markets，Africa',
    },

    {
      name: 'Gabriella Wong',
      jobTitle: 'Business Development Manager',
      email: 'gabriella@giantess-cn.com',
      responsibility: 'Responsible for developing strategic growth plans for the Europe & Latin America region, as well as planning trade shows and marketing campaigns.',
      region: 'Europe & Latin America',
    },

     {
      name: 'Alexander Zhang',
      jobTitle: 'Key Account Manager ',
      email: 'alexander@giantess-cn.com',
      responsibility: 'Distribution channels and refurbishment projects in Russian-speaking Markets',
      region: 'Russian-speaking Markets',
    },

     {
      name: 'Victoria Lee',
      jobTitle: 'Product Development Manager',
      email: 'victoria@giantess-cn.com',
      responsibility: 'Responsible for new product development, supplier sourcing, product testing, market demand analysis, and expansion of the GIANTESS and ZENOVA product portfolio.',
      region: 'Global',
    },

     {
      name: 'Aurora Law',
      jobTitle: 'Marketing & Brand Manager',
      email: 'aurora@giantess-cn.com',
      responsibility: 'Responsible for global brand development, digital marketing, trade show planning, content strategy, and lead generation initiatives across Europe, North America, Latin America, and emerging markets.',
      region: 'Global',
    },

       {
      name: 'Marcus Zhao',
      jobTitle: 'Supply Chain & Operations Manager',
      email: 'marcus@giantess-cn.com',
      responsibility: 'Responsible for inventory planning, supplier management, order fulfillment, warehouse operations, international logistics, and overall supply chain efficiency.',
      region: 'Global',
    },

      {
      name: 'Rafael Guo',
      jobTitle: 'Technical Support Engineer',
      email: 'rafael@giantess-cn.com',
      responsibility: 'Responsible for technical consultation, product compatibility verification, repair support, troubleshooting, installation guidance, and technical documentation for Zebra, Honeywell, Datalogic, and other barcode devices.',
      region: 'Global',
    },

      {
      name: 'Pietro Sun',
      jobTitle: 'Global Strategic Account Manager',
      email: 'pietro@giantess-cn.com',
      responsibility: 'International key accounts, multinational repair organizations, and enterprise maintenance projects.',
      region: 'Global',
    },

     {
      name: 'Wayne Law',
      jobTitle: 'Logistics Manager',
      email: 'logistic@giantess-cn.com',
      responsibility: 'Responsible for international shipping, freight coordination, customs clearance support, carrier management, shipment tracking, and logistics cost optimization.',
      region: 'Global',
    },
    
  ];

  protected isSubmitting = false;
  protected successMessage = '';
  protected errorMessage = '';

  protected readonly contactForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly contactService: ContactService
  ) {
    this.contactForm = this.formBuilder.nonNullable.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      phone: ['', [Validators.maxLength(50)]],
      subject: ['', [Validators.required, Validators.maxLength(150)]],
      message: ['', [Validators.required, Validators.maxLength(5000)]],
      privacyAccepted: [false, [Validators.requiredTrue]],
    });
  }

  protected submitContact(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const formValue = this.contactForm.getRawValue();
    const phone = formValue.phone.trim();
    const payload: ContactPayload = {
      name: formValue.name.trim(),
      email: formValue.email.trim(),
      phone: phone ? phone : null,
      subject: formValue.subject.trim(),
      message: formValue.message.trim(),
      privacyAccepted: formValue.privacyAccepted,
    };

    this.isSubmitting = true;

    this.contactService.sendContact(payload).subscribe({
      next: (response) => {
        if (!response.success) {
          this.errorMessage =
            response.message || 'Unable to send your message right now. Please try again later.';
          this.isSubmitting = false;
          return;
        }

        this.successMessage = response.message || 'Your message has been sent successfully.';
        this.contactForm.reset();
        this.isSubmitting = false;
      },
      error: (error: unknown) => {
        this.errorMessage =
          error instanceof Error
            ? error.message
            : 'Unable to send your message right now. Please try again later.';
        this.isSubmitting = false;
      },
    });
  }
}
