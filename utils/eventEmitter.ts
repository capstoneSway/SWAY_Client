// utils/eventEmitter.ts
import mitt from "mitt";

type Events = {
  nicknameChanged: void;
};

const emitter = mitt<Events>();

export default emitter;
