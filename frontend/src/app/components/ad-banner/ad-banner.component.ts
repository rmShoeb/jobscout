import { Component, input } from '@angular/core';

@Component({
  selector: 'app-ad-banner',
  standalone: true,
  imports: [],
  templateUrl: './ad-banner.component.html',
  styleUrl: './ad-banner.component.scss'
})
export class AdBannerComponent {
  // Allows parent to switch ad unit IDs cleanly.
  adSlotId = input<string>('default-ad-slot');
}
