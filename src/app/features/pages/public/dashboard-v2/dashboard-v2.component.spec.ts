import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardV2Component } from './dashboard-v2.component';
import { baseTestProviders } from '../../../../../test-providers';

describe('DashboardV2Component', () => {
  let component: DashboardV2Component;
  let fixture: ComponentFixture<DashboardV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardV2Component],
      providers: baseTestProviders 
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
