import toString from '../../src/utils/toString';
import mapValues from '../../src/utils/mapValues';
import Finity from '../../src';
import BaseConfigurator from '../../src/configuration/BaseConfigurator';
import StateMachine from '../../src/core/StateMachine';
import TaskScheduler from '../../src/core/TaskScheduler';

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

describe('BaseConfigurator', () => {
  it('getAncestor() returns null if it does not have a parent', () => {
    expect(new BaseConfigurator().getAncestor()).toBe(null);
  });
});

describe('mapValues', () => {
  it('maps values on a Map', () => {
    const mappedMap = mapValues(new Map([['foo', 'bar'], ['baz', 'qux']]), () => 'foobar', ['baz']);
    expect(mappedMap instanceof Map).toBe(true);
    expect(mappedMap.get('foo')).toBe('foobar');
    expect(mappedMap.get('baz')).toBe('qux');
  });
});

describe('HierarchicalStateMachine', () => {
  it('has a working toString function', async () => {
    const stateMachine = await Finity.configure().start();
    expect(stateMachine.toString()).toEqual('StateMachine(currentState: [object Undefined])');
  });

  it('returns null for getSubmachine() when there isn\'t one', async () => {
    const stateMachine = await Finity.configure().start();
    expect(stateMachine.getSubmachine()).toBe(null);
  });
});

describe('StateMachine', () => {
  describe('executeTrigger()', () => {
    it('returns undefined when no transition is attached', async () => {
      const bareMachine = new StateMachine(
        {
          global: {},
          initialState: null,
          states: new Map(),
        },
        new TaskScheduler(),
        stateMachine => ({ stateMachine })
      );

      const spy = spyOn(bareMachine, 'executeTrigger').and.callThrough();

      bareMachine.executeTrigger({ transitions: [] }, { stateMachine: bareMachine });

      expect(spy).toHaveBeenCalled();
      expect(spy.calls.mostRecent().args[0].returnValue).toBeUndefined();
    });
  });

  describe('getFirstAllowedTransitionForEvent()', () => {
    it('returns null when there isn\'t a state entry for the current state', async () => {
      const bareMachine = new StateMachine(
        {
          global: {},
          initialState: null,
          currentState: null,
          states: new Map(),
        },
        new TaskScheduler(),
        stateMachine => ({ stateMachine })
      );
      expect(await bareMachine.getFirstAllowedTransitionForEvent({
        stateMachine: bareMachine,
      })).toBeNull();
    });
  });

  describe('getSubmachine()', () => {
    it('returns null when there isn\'t one', async () => {
      const stateMachine = await Finity.configure().start();
      expect(stateMachine.getSubmachine()).toBe(null);
    });
  });
});
