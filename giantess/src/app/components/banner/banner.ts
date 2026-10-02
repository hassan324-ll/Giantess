import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-banner',
  imports: [],
  templateUrl: './banner.html',
  styleUrl: './banner.css',
})
export class Banner {
  @Input() title = '';
  @Input() breadcrumb = '';
  @Input() imagePath = 'about-banner.avif';
}
