import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransparentToolbarComponent } from './transparent-toolbar.component';
import { baseTestProviders } from '../../../../../test-providers';

describe('TransparentToolbarComponent', () => {
  let component: TransparentToolbarComponent;
  let fixture: ComponentFixture<TransparentToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransparentToolbarComponent],
      providers: baseTestProviders,  // ← Añadir esta línea
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransparentToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
