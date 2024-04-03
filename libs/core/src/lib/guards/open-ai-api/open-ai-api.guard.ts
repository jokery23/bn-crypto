import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { GptService } from '../../services';

export const openAiApiGuard: CanActivateFn = (route, state) => {
  const gptService = inject(GptService);
  const routerService = inject(Router);

  if (!gptService.getApiKey()) {
    routerService.navigate(['api-key']);
    return false;
  }
  return true;
};
