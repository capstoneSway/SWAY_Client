// utils/eventEmitter.ts
import mitt from "mitt";

type Events = {
  nicknameChanged: void;
  newNotification: any;
};

const emitter = mitt<Events>();

export default emitter;
