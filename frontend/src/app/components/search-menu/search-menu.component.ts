import { Component, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { GEO_ZONES } from '../../models/geodata';

export interface SearchCriteria {
  keyword: string;
  company: string;
  locationZones: string[];
  ignoreLocations: string;
  maxAgeDays: number;
  experienceLevel: string[];
  jobType: string[];
  isRemote: boolean;
}

@Component({
  selector: 'app-search-menu',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './search-menu.component.html',
  styleUrl: './search-menu.component.scss'
})
export class SearchMenuComponent {
  private fb = inject(FormBuilder);

  geoZones: string[] = GEO_ZONES;

  experienceLevelList = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead Level', 'Manager Level', 'Director Level', 'Executive Level'];
  jobTypeList = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship', 'Other'];

  maxAgeOptions = [
    { value: 1, label: 'Last 24 Hours' },
    { value: 3, label: 'Past 3 Days' },
    { value: 7, label: 'Past Week' },
    { value: 14, label: 'Past 2 Weeks' },
    { value: 30, label: 'Past Month' },
    { value: 90, label: 'Past 3 Months' },
    { value: 180, label: 'Past 6 Months' },
    { value: 365, label: 'Past Year' }
  ];

  searchForm: FormGroup = this.fb.group({
    keyword: ['', [Validators.required, Validators.minLength(2)]],
    company: [''],
    maxAgeDays: [30, [Validators.required]],
    experienceLevel: [[]],
    jobType: [[]],
    isRemote: [false],
    locationZones: [[]], // e.g. ['Middle East', 'Western Europe']
    ignoreLocations: ['']  // Free text e.g. "India, Pakistan"
  });

  onSearch(): void {
    if (this.searchForm.valid) {
      const v = this.searchForm.value;

      this.search.emit({
        keyword: v.keyword.trim(),
        company: v.company?.trim() || '',
        locationZones: v.locationZones || [],
        ignoreLocations: v.ignoreLocations || '',
        maxAgeDays: v.maxAgeDays,
        experienceLevel: v.experienceLevel || [],
        jobType: v.jobType || [],
        isRemote: v.isRemote || false
      });
    }
  }

  onClear(): void {
    this.searchForm.reset({
      keyword: '',
      company: '',
      maxAgeDays: 30,
      experienceLevel: [],
      jobType: [],
      isRemote: false,
      locationZones: [],
      ignoreLocations: ''
    });
    this.clear.emit();
  }

  search = output<SearchCriteria>();
  clear = output<void>();
}
