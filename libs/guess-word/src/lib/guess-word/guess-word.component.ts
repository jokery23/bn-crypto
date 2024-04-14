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
import { GptService } from '@binance/core';
import { consoleJsCommand } from './helpers';

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

  private defaultDescription = 'Web3 Gaming';

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
      context: new FormControl(this.defaultDescription),
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
    const excludedLetters = Object.keys(this.excludeLetters).filter(
      (letter) => this.excludeLetters[letter]
    );
    const includedLetters = Object.keys(this.includeLetters).filter(
      (letter) => this.includeLetters[letter]
    );
    const pattern = this.letters
      .map((letter) => (letter ? letter : '*'))
      .join('');

    const messages = [
      `create a list of ${countLetters}-letter words(20 variants) that fit the '${pattern}' pattern`,
    ];

    const jsLog = consoleJsCommand(countLetters);

    if (includedLetters.length) {
      messages.push(`include ${includedLetters.join(', ')} letters`);
    }

    if (includedLetters.length || this.letters.length) {
      jsLog.setIncludedLetters([
        ...includedLetters,
        ...this.letters.filter(Boolean),
      ]);
    }

    if (excludedLetters.length) {
      messages.push(`exclude ${excludedLetters.join(', ')} letters`);
      jsLog.setExcludedLetters(excludedLetters);
    }

    if (context) {
      messages.push(` especially within the context ${context}`);
    }

    console.log(jsLog.createString());

    try {
      const result = await this.gptService.ask(messages.join(', '));
      const correctWords = this.getCorrectWords(
        result,
        includedLetters,
        excludedLetters
      );

      this.result$.next(
        `Correct words:\n ${correctWords?.join(
          `\n`
        )} \n\n All words:\n\n ${result}`
      );
    } catch (error) {
      // check that the key is correct
      this.error$.next(error as string);
    }
  }

  getCorrectWords(
    result: string | null,
    includedLetters: string[],
    excludedLetters: string[]
  ): string[] {
    const words = result?.split('\n').filter((word) => word);

    const correctWords = words?.filter((word) => {
      if (includedLetters.length) {
        const correctLetters = includedLetters.filter((letter) => {
          return word.includes(letter);
        });

        if (!correctLetters.length) {
          return false;
        }
      }

      if (excludedLetters.length) {
        for (let i = 0; i < word.length; i++) {
          if (this.excludeLetters[word[i]]) {
            return false;
          }
        }
      }

      return true;
    });

    return correctWords ? this.getFiltered(correctWords) : [];
  }

  getFiltered(words: string[]): string[] {
    // temp1.textContent.split(/\s+/).filter((v) => v.length === 5 && new RegExp(`c\S\S\S\S`, 'i').test(v));
    const pattern = this.letters
      .map((letter) => (letter ? letter : `\\S`))
      .join('');
    const re = new RegExp(`${pattern}`, 'i');

    return words.filter((word) => re.test(word));
  }
}
