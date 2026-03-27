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
  pageSize = input.required<number>();
  totalPages = input.required<number>();
  
  pageChange = output<number>();
  sizeChange = output<number>();

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    }
  }

  onSizeChange(event: any): void {
    const size = parseInt(event.target.value, 10);
    this.sizeChange.emit(size);
  }
}
