import { NgModule } from '@angular/core';
import { NgUtilSelectableGridDirective } from './selectable-grid.directive';
import { NgUtilSelectableGridCellDirective } from './selectable-grid-cell.directive';

@NgModule({
  declarations: [
    NgUtilSelectableGridDirective,
    NgUtilSelectableGridCellDirective,
  ],
  imports: [],
  exports: [NgUtilSelectableGridDirective, NgUtilSelectableGridCellDirective],
})
export class NgUtilSelectableGridModule {}
