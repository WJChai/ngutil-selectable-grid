import { NgModule } from '@angular/core';
import { NgutilSelectableGridDirective } from './selectable-grid.directive';
import { NgUtilSelectableGridCellDirective } from './selectable-grid-cell.directive';

@NgModule({
  declarations: [
    NgutilSelectableGridDirective,
    NgUtilSelectableGridCellDirective,
  ],
  imports: [],
  exports: [NgutilSelectableGridDirective, NgUtilSelectableGridCellDirective],
})
export class NgutilSelectableGridModule {}
