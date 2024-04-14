interface Params {
  countLetters: number;
}

export function consoleJsCommand(countLetters: number) {
  const logs = [
    `document.querySelector('.css-fbxu07').textContent.split(' ')`,
    `filter((v) =>  v.length >= ${countLetters})`,
  ];

  return {
    setIncludedLetters(includedLetters: string[]) {
      logs.push(
        `filter((v) =>  ['${includedLetters.join(
          "','"
        )}'].every(c => v.toLowerCase().includes(c)))`
      );
    },
    setExcludedLetters(excludedLetters: string[]) {
      logs.push(
        `filter((v) =>  !['${excludedLetters.join(
          "','"
        )}'].some(c => v.toLowerCase().includes(c)))`
      );
    },
    createString() {
      return logs.join('.');
    },
  };
}
