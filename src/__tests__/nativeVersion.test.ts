import { readFileSync } from 'fs';
import { resolve } from 'path';

const root = resolve(__dirname, '../..');
const { version } = JSON.parse(
  readFileSync(resolve(root, 'package.json'), 'utf8')
);

test.each([
  ['ios/RNAudienzzModule.m', /kRNSdkVersion\s*=\s*@"([^"]+)"/],
  [
    'android/src/main/java/com/audienzzrn/RNAudienzzModule.kt',
    /RN_SDK_VERSION\s*=\s*"([^"]+)"/,
  ],
])('native au_rn_v matches the released package in %s', (path, pattern) => {
  const match = readFileSync(resolve(root, path), 'utf8').match(pattern);
  expect(match).not.toBeNull();
  expect(match![1]).toBe(version);
});
