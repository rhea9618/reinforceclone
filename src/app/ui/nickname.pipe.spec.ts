import { NicknamePipe } from './nickname.pipe';

describe('NicknamePipe', () => {
  it('create an instance', () => {
    const pipe = new NicknamePipe();
    expect(pipe).toBeTruthy();
  });
});
