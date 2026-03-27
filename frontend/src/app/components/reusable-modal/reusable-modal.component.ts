import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reusable-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reusable-modal.component.html',
  styleUrl: './reusable-modal.component.scss'
})
export class ReusableModalComponent {
  isOpen = input.required<boolean>();
  title = input.required<string>();
  message = input.required<string>();
  isError = input<boolean>(false);
  
  close = output<void>();

  onClose(): void {
    this.close.emit();
  }
}
