import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatabaseMaintenanceComponent } from './database-maintenance.component';

describe('DatabaseMaintenanceComponent', () => {
  let component: DatabaseMaintenanceComponent;
  let fixture: ComponentFixture<DatabaseMaintenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatabaseMaintenanceComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DatabaseMaintenanceComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
