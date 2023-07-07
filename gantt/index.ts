import Gantt from "./gantt";

(() => {
  window.Gantt = Gantt
})()


declare global {
  interface Window {
    Gantt: any;
  }
}