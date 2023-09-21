import { TestApp } from './test-app';

export interface IFixture {
  load(app: TestApp): Promise<void>;
}
