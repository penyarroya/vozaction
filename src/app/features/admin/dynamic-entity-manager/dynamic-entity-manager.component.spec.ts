import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicEntityManagerComponent } from './dynamic-entity-manager.component';

describe('DynamicEntityManagerComponent', () => {
  let component: DynamicEntityManagerComponent;
  let fixture: ComponentFixture<DynamicEntityManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicEntityManagerComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DynamicEntityManagerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
