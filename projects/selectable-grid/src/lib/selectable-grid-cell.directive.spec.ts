import { Component, DebugElement } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgUtilSelectableGridCellDirective } from './selectable-grid-cell.directive';
import { NgUtilSelectableGridDirective } from './selectable-grid.directive';
import { NgUtilSelectableGridModule } from './selectable-grid.module';

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
    <tr>
      <td
        ngutilSelectableGridCell
        [selectableGridCellRow]="1"
        [selectableGridCellCol]="0"
      ></td>
      <td
        ngutilSelectableGridCell
        [selectableGridCellRow]="1"
        [selectableGridCellCol]="1"
      ></td>
      <td
        ngutilSelectableGridCell
        [selectableGridCellRow]="1"
        [selectableGridCellCol]="2"
      ></td>
    </tr>
  </table>`,
})
class TestComponent {}

describe('NgUtilSelectableGridCellDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let gridDe: DebugElement;
  let gridDirective: NgUtilSelectableGridDirective;
  let cellDeR0C0: DebugElement;
  let cellDeR0C1: DebugElement;
  let cellDeR0C2: DebugElement;
  let cellDeR1C0: DebugElement;
  let cellDeR1C1: DebugElement;
  let cellDeR1C2: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [NgUtilSelectableGridModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    gridDe = fixture.debugElement.query(
      By.directive(NgUtilSelectableGridDirective)
    );
    gridDirective = gridDe.injector.get(
      NgUtilSelectableGridDirective
    ) as NgUtilSelectableGridDirective;

    [
      cellDeR0C0,
      cellDeR0C1,
      cellDeR0C2,
      cellDeR1C0,
      cellDeR1C1,
      cellDeR1C2,
    ] = fixture.debugElement.queryAll(
      By.directive(NgUtilSelectableGridCellDirective)
    );
  });

  it('should have class ngutil-selectable-grid-cell', () => {
    expect(cellDeR0C0.nativeElement).toHaveClass('ngutil-selectable-grid-cell');
  });

  it('should call grid startAt on mousedown', () => {
    const spy = spyOn(gridDirective, 'startAt').and.callThrough();

    cellDeR0C0.triggerEventHandler('mousedown', {});

    expect(spy).toHaveBeenCalledWith(0, 0);
    expect(cellDeR0C0.nativeElement).toHaveClass('selected');
  });

  it('should call grid movedTo once on mousemove', fakeAsync(() => {
    cellDeR0C0.triggerEventHandler('mousedown', {});
    tick();
    const spy = spyOn(gridDirective, 'movedTo').and.callThrough();
    cellDeR0C1.triggerEventHandler('mousemove', {});
    expect(spy).toHaveBeenCalledTimes(1);
    cellDeR0C1.triggerEventHandler('mousemove', {});
    expect(spy).toHaveBeenCalledTimes(1);
  }));

  it('should have selected css class on mouse move', fakeAsync(() => {
    cellDeR0C0.triggerEventHandler('mousedown', {});
    tick();
    cellDeR0C1.triggerEventHandler('mousemove', {});
    cellDeR0C2.triggerEventHandler('mousemove', {});

    expect(cellDeR0C2.nativeElement).toHaveClass('selected');
  }));

  it('should have selected css class if within selection', fakeAsync(() => {
    gridDirective.selected.emit({
      first: { row: 0, col: 1 },
      last: { row: 1, col: 2 },
    });
    tick();

    expect(cellDeR0C0.nativeElement).not.toHaveClass('selected');
    expect(cellDeR0C1.nativeElement).toHaveClass('selected');
    expect(cellDeR0C2.nativeElement).toHaveClass('selected');
    expect(cellDeR1C0.nativeElement).not.toHaveClass('selected');
    expect(cellDeR1C1.nativeElement).toHaveClass('selected');
    expect(cellDeR1C2.nativeElement).toHaveClass('selected');
  }));
});
