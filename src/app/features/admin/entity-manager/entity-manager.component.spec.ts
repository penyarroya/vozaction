import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EntityManagerComponent } from './entity-manager.component';

describe('EntityManagerComponent', () => {
  let component: EntityManagerComponent;
  let fixture: ComponentFixture<EntityManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntityManagerComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EntityManagerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
