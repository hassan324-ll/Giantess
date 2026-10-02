import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Banner } from '../../components/banner/banner';

@Component({
  selector: 'app-legal',
  imports: [Banner, RouterLink],
  templateUrl: './legal.html',
  styleUrl: './legal.css',
})
export class Legal {
  private readonly route = inject(ActivatedRoute);

  protected readonly pageTitle = this.route.snapshot.data['title'] ?? 'Legal Terms of Use';
  protected readonly breadcrumb = this.route.snapshot.data['breadcrumb'] ?? this.pageTitle;
  protected readonly isPrivacyPage = this.route.snapshot.data['type'] === 'privacy';
}
