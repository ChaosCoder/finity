import Finity from '../../src';

// eslint-disable-next-line no-unused-vars
import { tagFor, it, describe, beforeEach, afterEach, describeForAllTagTypes, forAllTagTypesIt } from '../support/forAllTagTypes';

describe('persistence', () => {
  forAllTagTypesIt('tracks persistent properties on stateData objects', async () => {
    const stateMachine = await Finity
      .configure()
      .initialState(tagFor('state1'))
        .on(tagFor('event1')).transitionTo(tagFor('state2'))
      .state(tagFor('state2'))
        .on(tagFor('event2')).transitionTo(tagFor('state1'))
          .withCondition(function () { return !this.getCurrentStateData().wentBackAlready; })
          .withAction((from, to, ctx) => {
            ctx.stateMachine.getCurrentStateData().wentBackAlready = true;
          })
        .on(tagFor('event2')).transitionTo(tagFor('state3'))
      .state(tagFor('state3'))
      .start();

    await stateMachine.handle(tagFor('event1'));
    await stateMachine.handle(tagFor('event2'));
    await stateMachine.handle(tagFor('event1'));
    await stateMachine.handle(tagFor('event2'));

    expect(stateMachine.getCurrentState()).toBe(tagFor('state3'));
    expect(stateMachine.getStateData(tagFor('state2')).wentBackAlready).toBe(true);
  });

  it('handles changed properties on state objects', async () => {
    const state1 = { name: 'state1' };
    const state2 = { name: 'state2' };
    const state3 = { name: 'state2' };

    const stateMachine = await Finity
      .configure()
      .initialState(state1)
        .on('event1').transitionTo(state2)
      .state(state2)
        .on('event2').transitionTo(state1)
          .withCondition(ctx => !ctx.stateMachine.getCurrentState().wentBackAlready)
          .withAction(from => {
            from.wentBackAlready = true;
          })
        .on('event2').transitionTo(state3)
      .state(state3)
      .start();

    await stateMachine.handle('event1');
    await stateMachine.handle('event2');
    await stateMachine.handle('event1');
    await stateMachine.handle('event2');

    expect(stateMachine.getCurrentState()).toBe(state3);
  });
});
