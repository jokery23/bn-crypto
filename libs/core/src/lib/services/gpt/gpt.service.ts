import OpenAI from 'openai';
import { Injectable } from '@angular/core';

enum GptModelEnums {
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  GPT_4_TURBO_PREVIEW = 'gpt-4-turbo-preview',
  GPT_4 = 'gpt-4',
}

const STORAGE_KEY = '__open_ai_key__';

@Injectable({
  providedIn: 'root',
})
export class GptService {
  getOpenAi(): OpenAI {
    return new OpenAI({
      apiKey: this.getApiKey() || '',
      dangerouslyAllowBrowser: true,
    });
  }

  getApiKey(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  }

  setApiKey(value: string): void {
    localStorage.setItem(STORAGE_KEY, value);
  }

  async ask(message: string): Promise<string | null> {
    const completion = await this.getOpenAi().chat.completions.create({
      messages: [{ role: 'system', content: message }],
      model: GptModelEnums.GPT_4,
    });

    return completion.choices[0].message.content;
  }
}
