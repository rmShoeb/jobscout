import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SearchCriteria {
  keyword: string;
  location: string;
  ignoreLocations: string;
  maxAgeDays: number;
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
  maxAgeDays = 30;

  search = output<SearchCriteria>();
  clear = output<void>();

  onSearch(): void {
    if (this.keyword.trim() && this.maxAgeDays > 0) {
      this.search.emit({
        keyword: this.keyword.trim(),
        location: this.location.trim(),
        ignoreLocations: this.ignoreLocations.trim(),
        maxAgeDays: this.maxAgeDays
      });
    }
  }

  onClear(): void {
    this.keyword = '';
    this.location = '';
    this.ignoreLocations = '';
    this.maxAgeDays = 30;
    this.clear.emit();
  }
}
