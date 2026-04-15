import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  currentPage = input.required<number>();
  hasMoreResults = input.required<boolean>();
  
  pageChange = output<number>();

  onPageChange(page: number): void {
    if (page >= 1) {
      this.pageChange.emit(page);
    }
  }
}
