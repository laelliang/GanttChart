import type { IEventBus } from './eventBus.d'
export default class EventBus implements IEventBus {
  private eventMap: { [eventName: string]: Function[] } = {};

  subscribe(eventName: string, callback: Function) {
    if (!this.eventMap[eventName]) {
      this.eventMap[eventName] = [];
    }
    this.eventMap[eventName].push(callback);
  }

  publish(eventName: string, ...args: any[]) {
    if (this.eventMap[eventName]) {
      this.eventMap[eventName].forEach(callback => {
        callback(...args);
      });
    }
  }
}
