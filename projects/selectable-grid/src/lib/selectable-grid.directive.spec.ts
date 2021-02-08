import { DOCUMENT } from '@angular/common';
import { Component, DebugElement } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CellCoordination } from './cell-coordination';
import { NgUtilSelectableGridCellDirective } from './selectable-grid-cell.directive';
import { NgutilSelectableGridDirective } from './selectable-grid.directive';
import { NgutilSelectableGridModule } from './selectable-grid.module';

@Component({
  template: ` <table ngutilSelectableGrid>
    <tr>
      <td
        ngutilSelectableGridCell
        [selectableGridCellRow]="0"
        [selectableGridCellCol]="0"
      ></td>
      <td
        ngutilSelectableGridCell
        [selectableGridCellRow]="0"
        [selectableGridCellCol]="1"
      ></td>
      <td
        ngutilSelectableGridCell
        [selectableGridCellRow]="0"
        [selectableGridCellCol]="2"
      ></td>
    </tr>
  </table>`,
})
class TestComponent {}

describe('NgUtilSelectableGridDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let gridDe: DebugElement;
  let gridDirective: NgutilSelectableGridDirective;
  let cellDe1: DebugElement;
  let cellDe2: DebugElement;
  let cellDe3: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [NgutilSelectableGridModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    gridDe = fixture.debugElement.query(
      By.directive(NgutilSelectableGridDirective)
    );
    gridDirective = gridDe.injector.get(
      NgutilSelectableGridDirective
    ) as NgutilSelectableGridDirective;

    [cellDe1, cellDe2, cellDe3] = fixture.debugElement.queryAll(
      By.directive(NgUtilSelectableGridCellDirective)
    );
  });

  it('should have class ngutil-selectable-grid-cell', () => {
    expect(cellDe1.nativeElement).toHaveClass('ngutil-selectable-grid-cell');
  });

  it('should start selection on mousedown', () => {
    expect(gridDirective.selecting).toBeFalse();
    cellDe1.triggerEventHandler('mousedown', {});

    gridDirective.selected.subscribe(
      ({
        first,
        last,
      }: {
        first: CellCoordination;
        last: CellCoordination;
      }) => {
        expect(first.col).toEqual(0);
        expect(first.row).toEqual(0);
        expect(last.col).toEqual(0);
        expect(last.row).toEqual(0);
      }
    );

    expect(cellDe1.nativeElement).toHaveClass('selected');
  });

  it('should continue selection on mousemove', fakeAsync(() => {
    const spy = jasmine.createSpy();
    gridDirective.selected.subscribe(spy);
    cellDe1.triggerEventHandler('mousedown', {});
    tick();
    expect(cellDe1.nativeElement).toHaveClass('selected');
    expect(cellDe2.nativeElement).not.toHaveClass('selected');

    cellDe2.triggerEventHandler('mousemove', {});
    expect(cellDe1.nativeElement).toHaveClass('selected');
    expect(cellDe2.nativeElement).toHaveClass('selected');
    expect(spy.calls.allArgs()).toEqual([
      [{ first: { row: 0, col: 0 }, last: { row: 0, col: 0 } }],
      [{ first: { row: 0, col: 0 }, last: { row: 0, col: 1 } }],
    ]);
  }));

  it('should only call grid movedTo once per selection session', fakeAsync(() => {
    cellDe1.triggerEventHandler('mousedown', {});
    tick();
    const spy = spyOn(gridDirective, 'movedTo').and.callThrough();
    cellDe2.triggerEventHandler('mousemove', {});
    expect(spy).toHaveBeenCalledTimes(1);
    cellDe2.triggerEventHandler('mousemove', {});
    expect(spy).toHaveBeenCalledTimes(1);
  }));

  it('should handle multiple selection session', fakeAsync(() => {
    const spy = jasmine.createSpy();
    gridDirective.selected.subscribe(spy);

    cellDe1.triggerEventHandler('mousedown', {});
    tick();
    expect(cellDe1.nativeElement).toHaveClass('selected');
    expect(cellDe2.nativeElement).not.toHaveClass('selected');
    expect(cellDe3.nativeElement).not.toHaveClass('selected');

    cellDe2.triggerEventHandler('mousemove', {});
    expect(cellDe1.nativeElement).toHaveClass('selected');
    expect(cellDe2.nativeElement).toHaveClass('selected');
    expect(cellDe3.nativeElement).not.toHaveClass('selected');

    // simulate clicking other space in document
    TestBed.inject(DOCUMENT).dispatchEvent(
      new Event('mousedown', { pageX: 1, pageY: 1 } as any)
    );
    TestBed.inject(DOCUMENT).dispatchEvent(
      new Event('mouseup', { pageX: 1, pageY: 1 } as any)
    );

    cellDe3.triggerEventHandler('mousedown', {});
    tick();
    expect(cellDe3.nativeElement).toHaveClass('selected');
    expect(cellDe2.nativeElement).not.toHaveClass('selected');
    expect(cellDe1.nativeElement).not.toHaveClass('selected');

    cellDe2.triggerEventHandler('mousemove', {});
    expect(cellDe2.nativeElement).toHaveClass('selected');
    expect(cellDe3.nativeElement).toHaveClass('selected');
    expect(cellDe1.nativeElement).not.toHaveClass('selected');

    expect(spy.calls.allArgs()).toEqual([
      [{ first: { row: 0, col: 0 }, last: { row: 0, col: 0 } }],
      [{ first: { row: 0, col: 0 }, last: { row: 0, col: 1 } }],
      [{ first: { row: 0, col: 2 }, last: { row: 0, col: 2 } }],
      [{ first: { row: 0, col: 1 }, last: { row: 0, col: 2 } }],
    ]);
  }));
});
