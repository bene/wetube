import {
  CHANGE_VIDEO,
  CHAT,
  CLIENT_LIST,
  CONNECT,
  DISCONNECT,
  VIDEO_ID_HANDSHAKE,
  YT_PAUSE,
  YT_PLAY
} from '../events';

import { EventEmitter } from 'events';
import { SERVER_URL } from '../environment';

class ChannelStore extends EventEmitter {

  constructor(component, username, channelId) {

    super();

    this.data = { ...this.getInitialData(), username, channelId };
    this.evtSource = null;
    this.hadHandshake = false;

    this.connect = this.connect.bind(this);
    this.close = this.close.bind(this);
    this.getData = this.getData.bind(this);
    this.onServerError = this.onServerError.bind(this);
    this.onServerEvent = this.onServerEvent.bind(this);
    this.setVideoId = this.setVideoId.bind(this);
    this.submitVideo = this.submitVideo.bind(this);
    this.postEvent = this.postEvent.bind(this);
    this.sendChatMessage = this.sendChatMessage.bind(this);

    this.on('change', (data) => {
      component.setState(this.data);
    });
  }

  getInitialData() {
    return {
      videoId: '',
      users: [],
      chatMessages: [],
    };
  }

  getData() {
    return this.data;
  }

  reset() {
    this.date = this.getInitialData();
  }

  connect() {
    this.evtSource = new EventSource(`${ SERVER_URL }?channelId=${ this.data.channelId }&clientId=${ this.data.username }`);
    this.evtSource.onmessage = this.onServerEvent;
    this.evtSource.onerror = this.onServerError;
  }

  close() {
    this.evtSource.close();
  }

  onServerError(e) {

  }

  onServerEvent(e) {

    const data = JSON.parse(e.data);
    const { origin, payload, type } = data;

    if (type === CHANGE_VIDEO) {
      this.data.videoId = payload;
      this.emit('change', { videoId: payload });
      return;
    } else if (type === CHAT) {
      this.data.chatMessages = [`${origin}: ${payload}`, ...this.data.chatMessages];
      this.emit('change', { chatMessages: this.data.chatMessages });
      return;
    } else if (type === CLIENT_LIST) {
      this.data.users = payload;
      this.emit('change', { users: payload });
      return;
    } else if (type === CONNECT) {

      if (this.data.videoId) {
        this.postEvent("VIDEO_ID_HANDSHAKE", this.data.videoId)
      }

      return;
    } else if (type === DISCONNECT) {

      return;
    } else if (type === VIDEO_ID_HANDSHAKE) {

      if (!this.hadHandshake) {
        this.hadHandshake = true;
        this.setVideoId(payload);
      }

      return;
    } else if (type === YT_PAUSE) {

      return;
    } else if (type === YT_PLAY) {

      return;
    } else {
      console.err('Unknown event');
    }
  }

  setVideoId(videoId) {
    this.data.videoId = videoId;
    this.emit('change', { videoId });
  }

  sendChatMessage(msg) {

    if (msg.toUpperCase() === "/CLEAR") {
      this.data.chatMessages = [];
      this.emit('change', { chatMessages: [] });
      return
    }

    this.postEvent("CHAT", msg);
  }

  submitVideo(videoId) {
    this.postEvent("CHANGE_VIDEO", videoId);
  }

  postEvent(type, payload) {

    fetch(`http://localhost:8080`, {
      method: "POST",
      body: JSON.stringify({
        channel_id: this.data.channelId,
        origin: this.data.username,
        type,
        payload
      })
    }).catch(err => {
      console.log(err);
    });
  }
}

export default ChannelStore;
