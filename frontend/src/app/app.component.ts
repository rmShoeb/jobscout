import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { JobService } from './services/job.service';
import { Job } from './models/job.model';
import { SearchCriteria, SearchMenuComponent } from './components/search-menu/search-menu.component';
import { JobCardComponent } from './components/job-card/job-card.component';
import { JobDetailsModalComponent } from './components/job-details-modal/job-details-modal.component';
import { ReusableModalComponent } from './components/reusable-modal/reusable-modal.component';
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { AdBannerComponent } from './components/ad-banner/ad-banner.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SearchMenuComponent,
    JobCardComponent,
    JobDetailsModalComponent,
    ReusableModalComponent,
    LoadingOverlayComponent,
    PaginationComponent,
    AdBannerComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private jobService = inject(JobService);

  // Core App State
  isLoading = signal<boolean>(false);
  isWakingUp = signal<boolean>(true);
  
  modalConfig = signal<{isOpen: boolean, title: string, message: string, isError: boolean}>({
    isOpen: true,
    title: 'Server Wake-up',
    message: 'Waking up the server... Because this is hosted on a free tier, it may take up to 50 seconds to boot. Please wait!',
    isError: false
  });

  jobs = signal<Job[]>([]);
  totalJobs = signal<number>(0);
  selectedJob = signal<Job | null>(null);
  
  // Pagination State
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalPages = signal<number>(1);
  
  // Cache to persist between page jumps
  lastCriteria = signal<SearchCriteria | null>(null);

  ngOnInit(): void {
    // Fire Wake-Up Check
    this.jobService.checkHealth().subscribe({
      next: () => {
        this.isWakingUp.set(false);
        if (this.modalConfig().title === 'Server Wake-up') {
          this.closeModal();
        }
      },
      error: (err) => {
        this.isWakingUp.set(false);
        this.showError('System Connectivity Error', 'Failed to connect to the backend server. Make sure it is running or try refreshing the page.');
      }
    });
  }

  onSearch(criteria: SearchCriteria): void {
    this.lastCriteria.set(criteria);
    this.currentPage.set(1);
    this.fetchJobs();
  }

  fetchJobs(): void {
    const criteria = this.lastCriteria();
    if (!criteria) return;

    this.isLoading.set(true);
    // Uses HTTP RxJS Observable alongside functional pipelining
    this.jobService.searchJobs(criteria, this.currentPage(), this.pageSize())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.jobs.set(res.jobs);
          this.totalJobs.set(res.total);
          this.totalPages.set(Math.ceil(res.total / this.pageSize()) || 1);
        },
        error: (err) => {
          this.showError('Search Failed', err.message);
        }
      });
  }

  onClearSearch(): void {
    this.jobs.set([]);
    this.totalJobs.set(0);
    this.totalPages.set(1);
    this.lastCriteria.set(null);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.fetchJobs();
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Elegant scroll snapping
  }

  onSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.fetchJobs();
  }

  openJobDetails(job: Job): void {
    this.selectedJob.set(job);
  }

  closeJobDetails(): void {
    this.selectedJob.set(null);
  }

  showError(title: string, message: string): void {
    this.modalConfig.set({ isOpen: true, title, message, isError: true });
  }

  closeModal(): void {
    this.modalConfig.update(c => ({ ...c, isOpen: false }));
  }
}
