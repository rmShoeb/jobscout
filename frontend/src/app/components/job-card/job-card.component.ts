import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Job } from '../../models/job.model';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-card.component.html',
  styleUrl: './job-card.component.scss'
})
export class JobCardComponent {
  // Utilizing Angular 18 Signal inputs for optimized zoneless change detection
  job = input.required<Job>();

  // Emits the job when card is clicked to open the modal
  jobClicked = output<Job>();

  onJobClick(): void {
    this.jobClicked.emit(this.job());
  }
}
