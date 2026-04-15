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
  
  modalConfig = signal<{isOpen: boolean, title: string, message: string, isError: boolean, isClosable: boolean}>({
    isOpen: false,
    title: 'Server Wake-up',
    message: 'Waking up the server... Because this is hosted on a free tier, it may take up to 50 seconds to boot. Please wait!',
    isError: false,
    isClosable: false
  });

  jobs = signal<Job[]>([]);
  selectedJob = signal<Job | null>(null);
  
  // Pagination State
  currentPage = signal<number>(1);
  hasMoreResults = signal<boolean>(false);
  
  // Cache to persist between page jumps
  lastCriteria = signal<SearchCriteria | null>(null);

  ngOnInit(): void {
    // Only show the wake-up modal if the server takes longer than 800ms to respond
    const wakeUpTimer = setTimeout(() => {
      if (this.isWakingUp()) {
        this.modalConfig.update(c => ({ ...c, isOpen: true }));
      }
    }, 800);

    // Fire Wake-Up Check
    this.jobService.checkHealth().subscribe({
      next: () => {
        clearTimeout(wakeUpTimer);
        this.isWakingUp.set(false);
        if (this.modalConfig().title === 'Server Wake-up') {
          this.closeModal();
        }
      },
      error: (err) => {
        clearTimeout(wakeUpTimer);
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

  fetchJobs(targetPage?: number): void {
    const criteria = this.lastCriteria();
    if (!criteria) return;

    const requestedPage = targetPage ?? this.currentPage();

    this.isLoading.set(true);
    this.jobService.searchJobs(criteria, requestedPage)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          if (res.jobs.length > 0) {
            // Only commit the page change when we actually got results
            this.currentPage.set(requestedPage);
            this.jobs.set(res.jobs);
            this.hasMoreResults.set(res.jobs.length >= 25);
          } else if (requestedPage > 1) {
            // Tried to go forward but no data — stay on current page
            this.hasMoreResults.set(false);
          } else {
            // Page 1 with no results
            this.jobs.set([]);
            this.hasMoreResults.set(false);
          }
        },
        error: (err) => {
          // Page stays unchanged on error
          this.showError('Search Failed', err.message);
        }
      });
  }

  onClearSearch(): void {
    this.jobs.set([]);
    this.hasMoreResults.set(false);
    this.lastCriteria.set(null);
  }

  onPageChange(page: number): void {
    this.fetchJobs(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }



  openJobDetails(job: Job): void {
    this.selectedJob.set(job);
  }

  closeJobDetails(): void {
    this.selectedJob.set(null);
  }

  showError(title: string, message: string): void {
    this.modalConfig.set({ isOpen: true, title, message, isError: true, isClosable: true });
  }

  closeModal(): void {
    this.modalConfig.update(c => ({ ...c, isOpen: false }));
  }
}
