import { StateMachineConfigurator } from './configuration';
import HierarchicalStateMachine from './core/HierarchicalStateMachine';
import { ignoreHandlerResult } from './core/StateMachine';

const Finity = {
  configure() {
    return new StateMachineConfigurator();
  },

  async start(config) {
    return await HierarchicalStateMachine.build(config).start();
  },

  build(config) {
    return HierarchicalStateMachine.build(config);
  },

  get ignoreHandlerResult() { return ignoreHandlerResult; },
};

export default Finity;
export * from './core/Errors';
