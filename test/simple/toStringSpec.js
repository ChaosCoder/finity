import toString from '../../src/utils/toString';

describe('toString', () => {
  it('passes through strings', () => {
    expect(toString('foobar')).toBe('foobar');
  });
  it('handles null', () => {
    expect(toString(null)).toBe('[object Null]');
  });
  it('handles undefined', () => {
    expect(toString(undefined)).toBe('[object Undefined]');
  });
  it('handles bare objects', () => {
    expect(toString({})).toBe('[object Object]');
  });
  it('handles symbols', () => {
    expect(toString(Symbol('foobar'))).toBe('Symbol(foobar)');
  });
});
