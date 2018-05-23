import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatInputModule,
  MatTableModule,
  MatToolbarModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatListModule,
  MatIconModule,
  MatExpansionModule,
  MatCheckboxModule,
  MatSelectModule,
  MatAutocompleteModule,
  MatTooltipModule,
} from '@angular/material';

const materialDesignModules = [
  CommonModule,
  MatToolbarModule,
  MatButtonModule,
  MatCardModule,
  MatInputModule,
  MatDialogModule,
  MatTableModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatListModule,
  MatIconModule,
  MatExpansionModule,
  MatCheckboxModule,
  MatSelectModule,
  MatAutocompleteModule,
  MatTooltipModule,
]

@NgModule({
  imports: materialDesignModules,
  exports: materialDesignModules,
})
export class CustomMaterialModule { }