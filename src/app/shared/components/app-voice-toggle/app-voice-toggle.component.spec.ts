import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppVoiceToggleComponent } from './app-voice-toggle.component';

describe('AppVoiceToggleComponent', () => {
  let component: AppVoiceToggleComponent;
  let fixture: ComponentFixture<AppVoiceToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppVoiceToggleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppVoiceToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
