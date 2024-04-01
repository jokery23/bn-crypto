import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { InputOtpModule } from 'primeng/inputotp';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ButtonModule } from 'primeng/button';
import { BehaviorSubject } from 'rxjs';
import { GptService } from '../../../../../apps/word-day/src/app/services/gpt.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputNumberModule,
    InputTextareaModule,
    InputTextModule,
    FormsModule,
    InputOtpModule,
    ToggleButtonModule,
    ButtonModule,
  ],
  templateUrl: './guess-word.component.html',
  styleUrl: './guess-word.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuessWordComponent implements OnInit {
  form: FormGroup;
  letters: string[] = [];
  excludeLetters: Record<string, boolean> = {};
  includeLetters: Record<string, boolean> = {};
  result$ = new BehaviorSubject<string | null>(null);
  error$ = new BehaviorSubject<string | null>(null);

  constructor(private fb: FormBuilder, private gptService: GptService) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    this.initWatchers();
    const allLetters = Array.from({ length: 26 }, (_, i) =>
      String.fromCharCode(i + 97)
    );

    this.excludeLetters = allLetters.reduce((acc, letter) => {
      acc[letter] = false;
      return acc;
    }, {} as Record<string, boolean>);

    this.includeLetters = allLetters.reduce((acc, letter) => {
      acc[letter] = false;
      return acc;
    }, {} as Record<string, boolean>);
  }

  createForm(): FormGroup {
    return this.fb.group({
      countLetters: new FormControl(null, [
        Validators.required,
        Validators.min(2),
      ]),
      context: new FormControl('Bitcoin Halving 2024', [Validators.required]),
    });
  }

  initWatchers(): void {
    this.form.get('countLetters')?.valueChanges.subscribe((count) => {
      if (count) {
        this.letters = Array.from({ length: count }).map(() => '');
      }
    });
  }

  changeLetter(letter: string, index: number): void {
    this.letters[index] = letter.toLowerCase();
  }

  toggleIncludeLetter(letter: string): void {
    this.includeLetters[letter] = !this.includeLetters[letter];
  }

  toggleExcludeLetter(letter: string): void {
    this.excludeLetters[letter] = !this.excludeLetters[letter];
  }

  uncheckAllIncludedLetters(): void {
    Object.keys(this.excludeLetters).forEach((letter) => {
      this.excludeLetters[letter] = false;
    });
  }

  uncheckAllExcludedLetters(): void {
    Object.keys(this.excludeLetters).forEach((letter) => {
      this.excludeLetters[letter] = false;
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      return;
    }
    this.result$.next('Asking...');
    this.error$.next(null);

    const context = this.form.get('context')?.value;
    const countLetters = this.form.get('countLetters')?.value;
    const excludedLetters = Object.keys(this.excludeLetters)
      .filter((letter) => this.excludeLetters[letter])
      .join(', ');
    const includedLetters = Object.keys(this.includeLetters)
      .filter((letter) => this.includeLetters[letter])
      .join(', ');
    const pattern = this.letters
      .map((letter) => (letter ? letter : '*'))
      .join('');

    const messages = [
      `create a list of ${countLetters}-letter words(20 variants) that fit the '${pattern}' pattern`,
    ];

    if (includedLetters) {
      messages.push(`include ${includedLetters} letters`);
    }

    if (excludedLetters) {
      messages.push(`exclude ${excludedLetters} letters`);
    }

    messages.push(` especially within the context ${context}`);

    try {
      const result = await this.gptService.ask(messages.join(', '));
      this.result$.next(result);
    } catch (error) {
      // check that the key is correct
      this.error$.next(error as string);
    }
  }
}
