import StateMachine from './StateMachine';
import TaskScheduler from './TaskScheduler';
import toString from '../utils/toString';

export default class HierarchicalStateMachine {
  constructor(rootStateMachine, currentStateMachine, taskScheduler) {
    this.rootStateMachine = rootStateMachine;
    this.currentStateMachine = currentStateMachine;
    this.taskScheduler = taskScheduler;
  }

  static build(config) {
    const taskScheduler = new TaskScheduler();
    let rootStateMachine;
    const createContext = stateMachine => ({
      stateMachine: new HierarchicalStateMachine(rootStateMachine, stateMachine, taskScheduler),
    });
    rootStateMachine = new StateMachine(config, taskScheduler, createContext);
    return new HierarchicalStateMachine(rootStateMachine, rootStateMachine, taskScheduler);
  }

  async start() {
    await this.taskScheduler.enqueue(() => this.rootStateMachine.start());
    await this.taskScheduler.runAll();
    return this;
  }

  async stop() {
    await this.taskScheduler.enqueue(async () => {
      this.rootStateMachine.stop();
    });
    await this.taskScheduler.runAll();
    return this;
  }

  isStarted() {
    return this.getStateMachines().reduce((acc, x) => acc && x.isStarted(), true);
  }

  isStopped() {
    return this.getStateMachines().reduce((acc, x) => acc && !x.isStarted(), true);
  }

  async whenComplete() {
    await this.taskScheduler.runAll();
  }

  getCurrentState() {
    return this.currentStateMachine.getCurrentState();
  }

  getStateData(state) {
    return this.currentStateMachine.getStateData(state);
  }

  getCurrentStateData() {
    return this.currentStateMachine.getCurrentStateData();
  }

  getSubmachine() {
    const submachine = this.currentStateMachine.getSubmachine();
    if (submachine) {
      return new HierarchicalStateMachine(this.rootStateMachine, submachine, this.taskScheduler);
    }
    return null;
  }

  getStateHierarchy() {
    return this.getStateMachines()
      .map(stateMachine => stateMachine.getCurrentState());
  }

  async canHandle(event, eventPayload) {
    const stateMachines = this.getStateMachines();
    for (let i = stateMachines.length - 1; i >= 0; i--) {
      // eslint-disable-next-line no-await-in-loop
      if (await stateMachines[i].canHandle(event, eventPayload)) {
        return true;
      }
    }
    return false;
  }

  handle(event, eventPayload) {
    return (new Promise((resolve, reject) => {
      this.taskScheduler.enqueue(async () => {
        const stateMachines = this.getStateMachines();
        for (let i = stateMachines.length - 1; i >= 0; i--) {
          // eslint-disable-next-line no-await-in-loop
          if (await stateMachines[i].canHandle(event, eventPayload)) {
            // eslint-disable-next-line no-await-in-loop
            return await (stateMachines[i].handle(event, eventPayload));
          }
        }
        return await this.currentStateMachine.handleUnhandledEvent(event, eventPayload);
      }).then(resolve, reject);
    })).catch(err => { throw err; });
  }

  getStateMachines() {
    const stateMachines = [];
    let stateMachine = this.rootStateMachine;
    do {
      stateMachines.push(stateMachine);
      stateMachine = stateMachine.getSubmachine();
    } while (stateMachine);
    return stateMachines;
  }

  toString() {
    return `StateMachine(currentState: ${toString(this.getCurrentState())})`;
  }
}
