export interface IEventBus {
  subscribe(eventName: string, callback: Function): void
  publish(eventName: string, ...args: any[]): void

}