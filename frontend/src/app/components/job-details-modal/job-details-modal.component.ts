import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Job } from '../../models/job.model';

@Component({
  selector: 'app-job-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-details-modal.component.html',
  styleUrl: './job-details-modal.component.scss'
})
export class JobDetailsModalComponent {
  isOpen = input.required<boolean>();
  job = input.required<Job | null>();
  closeModal = output<void>();

  onClose(): void {
    this.closeModal.emit();
  }
}
