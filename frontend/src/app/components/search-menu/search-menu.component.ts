import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SearchCriteria {
  keyword: string;
  location: string;
  ignoreLocations: string;
}

@Component({
  selector: 'app-search-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-menu.component.html',
  styleUrl: './search-menu.component.scss'
})
export class SearchMenuComponent {
  keyword = '';
  location = '';
  ignoreLocations = '';

  search = output<SearchCriteria>();
  clear = output<void>();

  onSearch(): void {
    if (this.keyword.trim()) {
      this.search.emit({
        keyword: this.keyword.trim(),
        location: this.location.trim(),
        ignoreLocations: this.ignoreLocations.trim()
      });
    }
  }

  onClear(): void {
    this.keyword = '';
    this.location = '';
    this.ignoreLocations = '';
    this.clear.emit();
  }
}
