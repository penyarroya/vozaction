import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EntitySidebarComponent } from './entity-sidebar.component';

describe('EntitySidebarComponent', () => {
  let component: EntitySidebarComponent;
  let fixture: ComponentFixture<EntitySidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntitySidebarComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EntitySidebarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
