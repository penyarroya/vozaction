import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { AppVoiceToggleComponent } from './app-voice-toggle.component';
import { VoiceToggleComponent } from './app-voice-toggle.component';
import { baseTestProviders } from '../../../../test-providers';

describe('AppVoiceToggleComponent', () => {
  let component: VoiceToggleComponent;
  let fixture: ComponentFixture<VoiceToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoiceToggleComponent],
      providers: baseTestProviders,  // ← Añadir esta línea
      
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoiceToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
