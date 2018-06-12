import { StateMachineConfigurator } from './configuration';
import HierarchicalStateMachine from './core/HierarchicalStateMachine';

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
};

export default Finity;
export * from './core/Errors';
