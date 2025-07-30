import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';


import * as Papa from 'papaparse';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    DragDropModule,
    MatTableModule,
    MatTooltip
  ],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]

})
export class UploadComponent {
  trim = true;
  blanks = true;
  dedupe = true;

  isDragOver = false;
  selectedFile: File | null = null;

  previewData: { value: string, error?: string }[][] = [];
  displayedColumns: string[] = [];

  totalEmpty = 0;
  totalWhitespace = 0;
  totalDuplicate = 0;
  rowsNeedingCleanup = 0;
  totalPreviewed = 0;

  constructor(private router: Router) { }


  onSubmit() {
    if (!this.selectedFile) return;
    
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    const params = {
      trim: this.trim,
      blanks: this.blanks,
      dedupe: this.dedupe
    };

    fetch(`http://localhost:8080/api/upload?${new URLSearchParams(params as any).toString()}`, {
      method: 'POST',
      body: formData
    })
      .then(response => response.blob())
      .then(blob => {
        if (this.selectedFile == null) return;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cleaned_${this.selectedFile.name}`;
        a.click();
        this.router.navigate(['/success']);
      })
      .catch(err => alert('Upload failed.'));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];

      Papa.parse(this.selectedFile, {
        complete: (result) => {
          const rawData = result.data as string[][];
          const header = rawData[0];
          const rows = rawData.slice(1);

          const seen = new Set<string>();
          const previewRows = rows.slice(0, 5);

          this.totalEmpty = 0;
          this.totalWhitespace = 0;
          this.totalDuplicate = 0;
          this.rowsNeedingCleanup = 0;
          this.totalPreviewed = previewRows.length;

          const parsedPreview = previewRows.map(row => {
            const rowKey = row.join('||').trim();
            const isDuplicate = seen.has(rowKey);
            seen.add(rowKey);

            let rowHasError = false;

            const parsedRow = row.map(cell => {
              let error: string | undefined;
              if (!cell.trim()) {
                error = 'Empty cell';
                this.totalEmpty++;
              } else if (cell !== cell.trim()) {
                error = 'Trailing whitespace';
                this.totalWhitespace++;
              }

              if (isDuplicate) {
                error = error ? `${error}, Duplicate row` : 'Duplicate row';
                this.totalDuplicate++;
              }

              if (error) rowHasError = true;

              return { value: cell, error };
            });

            if (rowHasError) this.rowsNeedingCleanup++;

            return parsedRow;
          });

          this.previewData = parsedPreview;
          this.displayedColumns = header.map((_, i) => 'col' + i) || [];
        }
      });
    }

    
  }

  getCellError(cell: string): string | undefined {
    if (!cell.trim()) return 'Empty cell';
    if (cell !== cell.trim()) return 'Trailing whitespace';
    return undefined;
  }


  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    if (event.dataTransfer?.files.length) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  getColumnValue(row: { value: string, error?: string }[], index: number): string {
    return row[index]?.value;
  }

}
