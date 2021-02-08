import { DOCUMENT } from '@angular/common';
import {
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  OnDestroy,
  Output,
} from '@angular/core';
import { mixinDestroyed } from '@cwj0911/ngutil-common-behavior-mixins';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CellCoordination } from './cell-coordination';

class SelectableGridDirectiveBase {}
const _SelectableGridDirectiveMixinBase = mixinDestroyed(
  SelectableGridDirectiveBase
);

/** @dynamic */
@Directive({
  selector: '[ngutilSelectableGrid]',
})
export class NgutilSelectableGridDirective
  extends _SelectableGridDirectiveMixinBase
  implements OnDestroy {
  @Output() selected = new EventEmitter<{
    first: CellCoordination;
    last: CellCoordination;
  }>();

  readonly end$ = new Subject<void>();
  constructor(
    el: ElementRef<HTMLDivElement | HTMLTableElement>,
    @Inject(DOCUMENT) document: Document
  ) {
    super();

    el.nativeElement.style.userSelect = 'none';
    fromEvent(document, 'mouseup')
      .pipe(takeUntil(this.destroyed))
      .subscribe(() => {
        this._start = undefined;
        this._end = undefined;
        this.selecting = false;
        this.end$.next();
      });
  }

  selecting = false;

  private _end: CellCoordination | undefined;
  movedTo(row: number, col: number) {
    this._end = { row, col };
    this.emitSelected();
  }

  private _start: CellCoordination | undefined;
  startAt(row: number, col: number) {
    this.selecting = true;
    this._start = { row, col };
    this._end = { row, col };

    // wait for a tick to highlight cell
    setTimeout(() => {
      this.emitSelected();
    });
  }

  private emitSelected() {
    if (this._start === undefined || this._end === undefined) return;
    const first = {
      row: Math.min(this._start.row, this._end.row),
      col: Math.min(this._start.col, this._end.col),
    };
    const last = {
      row: Math.max(this._start.row, this._end.row),
      col: Math.max(this._start.col, this._end.col),
    };
    this.selected.emit({ first, last });
  }

  ngOnDestroy() {
    this._markDestroyed();
  }
}
