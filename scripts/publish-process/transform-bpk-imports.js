/*
 * Backpack - Skyscanner's Design System
 *
 * Copyright 2016-2020 Skyscanner Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* @flow strict */

const fs = require('fs');
const { execSync } = require('child_process');

const updateImports = (file, dirs) =>
  new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      }
      let result = data;

      dirs.forEach(pkg => {
        const split = result.split(`from '${pkg}`);
        if (split.length === 1) {
          return;
        }
        result = split.join(`from '${pkg}-css`);
      });

      fs.writeFile(file, result, 'utf8', err2 => {
        if (err2) return reject(err2);
        return resolve();
      });
    });
  });

// eslint-disable-next-line no-console
console.log('Crunching Backpack import paths...');

const dirs = execSync('ls packages | grep -v "react-version-test.js"')
  .toString()
  .split('\n')
  .filter(s => s !== '');

const jsFiles = execSync(
  'find packages -name "*.js" -o -name "*.jsx" | grep -v node_modules',
)
  .toString()
  .split('\n')
  .filter(s => s !== '');

const updatePromises = jsFiles.map(jF => updateImports(jF, dirs));

Promise.all(updatePromises).then(() => {
  // eslint-disable-next-line no-console
  console.log('All good.  👍');
  process.exit(0);
});