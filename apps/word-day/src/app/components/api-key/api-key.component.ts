import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { GptService } from '../../services/gpt.service';

@Component({
  selector: 'app-api-key',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextareaModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
  ],
  templateUrl: './api-key.component.html',
  styleUrl: './api-key.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiKeyComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private gptService: GptService) {
    const apiKey = this.gptService.getApiKey();
    this.form = this.fb.group({
      apiKey: new FormControl(apiKey, [Validators.required]),
    });
  }

  save() {
    if (this.form.valid) {
      this.gptService.setApiKey(this.form.value.apiKey);
      alert('API Key saved');
    }
  }
}
