import { DOCUMENT } from '@angular/common';
import {
  Directive,
  ElementRef,
  HostListener,
  Inject,
  Input,
  OnDestroy,
} from '@angular/core';
import { mixinDestroyed } from '@cwj0911/ngutil-common-behavior-mixins';
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil, tap, throttle } from 'rxjs/operators';
import { CellCoordination } from './cell-coordination';
import { NgUtilSelectableGridDirective } from './selectable-grid.directive';

class SelectableGridCellDirectiveBase {}
const _SelectableGridCellDirectiveMixinBase = mixinDestroyed(
  SelectableGridCellDirectiveBase
);

/** @dynamic */
@Directive({
  selector: '[ngutilSelectableGridCell]',
})
export class NgUtilSelectableGridCellDirective
  extends _SelectableGridCellDirectiveMixinBase
  implements OnDestroy {
  @Input('selectableGridCellRow') row: number | undefined;
  @Input('selectableGridCellCol') col: number | undefined;

  constructor(
    private grid: NgUtilSelectableGridDirective,
    private el: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) public document: Document
  ) {
    super();

    el.nativeElement.classList.add('ngutil-selectable-grid-cell');

    this.move$
      .pipe(
        throttle(() => grid.end$),
        takeUntil(this.destroyed)
      )
      .subscribe(() => {
        this.grid.movedTo(this.row!, this.col!);
      });

    fromEvent(document, 'mousedown')
      .pipe(takeUntil(this.destroyed))
      .subscribe(() => {
        el.nativeElement.classList.remove('selected');
      });

    this.grid.selected
      .pipe(filter(this.withinSelected), takeUntil(this.destroyed))
      .subscribe(() => {
        this.addHighlightedClass();
      });
  }

  @HostListener('mousedown') down() {
    if (this.grid.selecting) return;
    if (this.row === undefined || this.col === undefined) {
      throw new Error('unknown col and row index');
    }
    this.grid.startAt(this.row, this.col);
    this.addHighlightedClass();
  }

  private readonly move$ = new Subject<void>();
  @HostListener('mousemove') move() {
    if (!this.grid.selecting) return;
    if (this.row === undefined || this.col === undefined) {
      throw new Error('unknown col and row index');
    }
    this.move$.next();
    this.addHighlightedClass();
  }

  private addHighlightedClass() {
    this.el.nativeElement.classList.add('selected');
  }

  private withinSelected = ({
    first,
    last,
  }: {
    first: CellCoordination;
    last: CellCoordination;
  }) => {
    if (this.row === undefined || this.col === undefined) {
      return false;
    }
    return (
      first.col <= this.col &&
      this.col <= last.col &&
      first.row <= this.row &&
      this.row <= last.row
    );
  };

  ngOnDestroy() {
    this._markDestroyed();
  }
}
