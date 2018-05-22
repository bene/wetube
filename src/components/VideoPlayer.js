import { Badge, Button, Card, CardBody, CardFooter, CardHeader, Input, InputGroup, InputGroupAddon } from 'reactstrap';
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
import React, { Component } from 'react';

import { Link } from 'react-router-dom';
import { SERVER_URL } from '../environment';
import YouTube from 'react-youtube';

class VideoPlayer extends Component {

  constructor(props) {

    super(props);

    this.state = {
      player: null,
      submitInput: "",
      chatInput: "",
      channel: {
        video: {
          id: ""
        },
        users: [],
        chat: []
      }
    }

    this.hadHandshake = false;
    this.sendEvent = false;

    this.connect = this.connect.bind(this);
    this.onServerEvent = this.onServerEvent.bind(this);
    this.onReady = this.onReady.bind(this);
    this.onStateChange = this.onStateChange.bind(this);
    this.onChat = this.onChat.bind(this);
    this.onSubmitVideo = this.onSubmitVideo.bind(this);
    this.postEvent = this.postEvent.bind(this);
    this.onPlay = this.onPlay.bind(this);

    this.connect();
  }

  connect() {
    const evtSource = new EventSource(`${ SERVER_URL }?channelId=${ this.props.channelId }&clientId=${ this.props.username }`);
    evtSource.onmessage = this.onServerEvent;
  }

  onServerEvent(e) {

    const data = JSON.parse(e.data);

    const origin = data.origin;
    const payload = data.payload ? data.payload : {};

    switch (data.type) {
      case VIDEO_ID_HANDSHAKE:

        if (!this.hadHandshake) {

          this.hadHandshake = true;

          this.setState({
            channel: {
              ...this.state.channel,
              video: {
                id: payload
              }
            }
          });
        }

        break;
      case CONNECT:

        if (this.state.channel.video.id) {
          this.postEvent("VIDEO_ID_HANDSHAKE", this.state.channel.video.id)
        }

        if (!this.state.channel.users.includes(origin)) {
          this.setState({
            channel: {
              ...this.state.channel,
              users: [...this.state.channel.users, origin]
            }
          })
        }

        if (this.props.username !== origin) {
          this.setState({
            channel: {
              ...this.state.channel,
              chat: [...this.state.channel.chat, `${origin} has entered the channel.`]
            }
          });
        }

        break;
      case DISCONNECT:

        const index = this.state.channel.chat.indexOf(origin);

        if (this.state.channel.users.includes(origin)) {

          const users = this.state.channel.users;
          users.splice(index, 1);

          this.setState({
            channel: {
              ...this.state.channel,
              users
            }
          })
        }

        this.setState({
          channel: {
            ...this.state.channel,
            chat: [...this.state.channel.chat, `${origin} has left the channel.`]
          }
        });

        break;
      case CHAT:

        this.setState({
          channel: {
            ...this.state.channel,
            chat: [`${origin}: ${payload}`, ...this.state.channel.chat]
          }
        });
        break;
      case YT_PLAY:
        if (origin !== this.props.username && this.state.player.getPlayerState !== 1) {
          console.log("PLAY");
          this.state.player.seekTo(payload);
          this.state.player.playVideo();
        }
        break;
      case YT_PAUSE:
        if (origin !== this.props.username && this.state.player.getPlayerState !== 2) {
          console.log("PAUSE");
          console.log(origin);
          this.state.player.seekTo(payload);
          this.state.player.pauseVideo();
        }
        break;
      case CHANGE_VIDEO:
        const videoId = data.payload;
        this.setState({
          channel: {
            ...this.state.channel,
            video: {
              id: videoId
            }
          }
        });
        break;
      case CLIENT_LIST:
        const users = data.payload;

        this.setState(state => ({
          channel: {
            ...state.channel,
            users: users
          }
        }));
        break;
      default:

    }
  }

  postEvent(type, payload) {

    fetch(`http://localhost:8080`, {
      method: "POST",
      body: JSON.stringify({
        channel_id: this.props.channelId,
        origin: this.props.username,
        type,
        payload
      })
    }).catch(err => {
      console.log(err);
    })
  }

  onReady(e) {
    if (this.state.player !== e.target) {
      this.setState({
        player: e.target
      });
    }
  }

  onPlay() {
    console.log("TEST");
    this.state.player.playVideo();
  }

  onStateChange(e) {

    console.log(e);

    switch (e.data) {
      case 1:
        this.postEvent("YT_PLAY", e.target.getCurrentTime())
        this.state.player.playVideo();
        console.log("IUHDSU");
        break;
      case 2:
        this.postEvent("YT_PAUSE", e.target.getCurrentTime())
        break;
      case 3:

        break;
      case 5:

        break;
      default:

    }
  }

  onChat(e) {

    e.preventDefault();

    const msg = this.state.chatInput;

    if (msg.length === 0) {
      return;
    }

    this.setState({
      chatInput: ""
    });

    if (msg.toUpperCase() === "/CLEAR") {
      this.setState({
        channel: {
          ...this.state.channel,
          chat: []
        }
      });
      return
    }

    this.postEvent("CHAT", msg);
  }

  onSubmitVideo(e) {

    const url = require('url');
    const query = url.parse(this.state.submitInput, true).query;
    const videoId = query.v;

    this.postEvent("CHANGE_VIDEO", videoId);
  }

  render() {

    const users = this.state.channel.users.map(u => (
      <li key={ u } className="list-group-item">
        <h5><Badge color="success" pill>Ready</Badge> { u }</h5>
      </li>
    ));

    const chat = this.state.channel.chat.length > 0 ? this.state.channel.chat.map(msg => (
      <li key={ Math.random() }>
      { msg }
      </li>
    )) : (
      <div className="blankslate">
        <h3>No messages</h3>
        <p>Get started by sending a message</p>
      </div>
    );

    let containerWidth = 640;

    if (window.innerWidth >= 1200) {
      containerWidth = 1140;
    } else if (window.innerWidth >= 992) {
      containerWidth = 960;
    } else if (window.innerWidth >= 768) {
      containerWidth = 720;
    } else if (window.innerWidth >= 576) {
      containerWidth = 540;
    }

    containerWidth = containerWidth - 30; // padding

    const opts = {
      height: (1080/1920)*containerWidth,
      width: containerWidth,
      playerVars: {
        rel: 0,
        autoplay: 0,
        iv_load_policy: 3,
        modestbranding: 1
      }
    };

    const videoPlayer = this.state.channel.video.id ? (
      <YouTube
        id="player"
        videoId={ this.state.channel.video.id }
        opts={ opts }
        onReady={ this.onReady }
        onPlay={ this.onPlay }
        onStateChange={ this.onStateChange }
      />
    ) : (
      <div className="blankslate video-blankslate">
        <h3>No Video</h3>
        <p>Get started by submitting a video.</p>
      </div>
    );

    return (
      <div>
        <header>
          <nav className="navbar navbar-expand-md navbar-dark bg-dark">
            <div className="container">
              <Link className="navbar-brand" to="/">WeTube</Link>
              <form className="form-inline my-2 my-lg-0">
                <Link className="btn btn-outline-danger my-2 my-sm-0" to="/">Leave Channel</Link>
              </form>
            </div>
          </nav>
        </header>

        <main role="main">
          <section className="jumbotron text-center">
            <div className="container">
              { videoPlayer }
            </div>
          </section>

          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <Card>
                  <CardHeader className="videoInput">
                    <InputGroup>
                      <Input value={ this.state.submitInput } onChange={(e) => this.setState({ submitInput: e.target.value}) } />
                      <InputGroupAddon addonType="append" onClick={(e) => this.onSubmitVideo(e) }><Button>Watch</Button></InputGroupAddon>
                    </InputGroup>
                  </CardHeader>
                </Card>
              </div>
            </div>
            <div className="row">
              <div className="col-md-4">
                <Card>
                  <CardHeader>Folks in this channel</CardHeader>
                  <ul className="list-group list-group-flush">
                  { users }
                  </ul>
                </Card>
              </div>
              <div className="col-md-8">
                <Card>
                  <CardHeader>Chat</CardHeader>
                  <CardBody className="chat">
                  { chat }
                  </CardBody>
                  <CardFooter>
                    <form onSubmit={ this.onChat }>
                      <InputGroup>
                        <Input value={ this.state.chatInput } onChange={(e) => this.setState({ chatInput: e.target.value}) } />
                        <InputGroupAddon addonType="append" type="submit"><Button>Send</Button></InputGroupAddon>
                      </InputGroup>
                    </form>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default VideoPlayer;
