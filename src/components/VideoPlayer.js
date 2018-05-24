import { Badge, Button, Card, CardBody, CardFooter, CardHeader, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import React, { Component } from 'react';

import ChannelStore from '../stores/ChannelStore';
import { Link } from 'react-router-dom';
import { PUBLIC_URL } from '../environment';
import YouTube from 'react-youtube';

class VideoPlayer extends Component {

  constructor(props) {

    super(props);

    this.store = new ChannelStore(this, this.props.username, this.props.channelId);
    this.state = {
      player: null,
      channel: this.store.getData(),
      submitInput: "",
      chatInput: "",
      clipboard: {
        isCopying: false,
        resetButtonTimeout: null,
        buttonMessage: 'Copy Link to Clipboard'
      }
    };

    this.onChat = this.onChat.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onReady = this.onReady.bind(this);
    this.onStateChange = this.onStateChange.bind(this);
    this.onSubmitVideo = this.onSubmitVideo.bind(this);
    this.onCopyToClipboard = this.onCopyToClipboard.bind(this);
  }

  componentDidMount() {
    this.store.connect();
  }

  componentWillUnmount() {
    this.store.close();
  }

  onCopyToClipboard(e) {

    const copyText = this.refs.copyInput;

    this.setState({
      clipboard: {
        isCopying: true,
        resetButtonTimeout: null
      }
    }, () => {

      copyText.select();
      document.execCommand('copy');
      this.setState({
        clipboard: {
          isCopying: false,
          buttonMessage: "Copied!",
          resetButtonTimeout: setTimeout(() => {

            this.setState({
              clipboard: {
                ...this.state.clipboard,
                buttonMessage: "Copy Link to Clipboard"
              }
            });
          }, 1500)
        }
      });
    });
  }

  onReady(e) {
    if (this.state.player !== e.target) {
      this.setState({
        player: e.target
      });
    }
  }

  onPlay() {
    this.state.player.playVideo();
  }

  onStateChange(e) {

    switch (e.data) {
      case 1:

        break;
      case 2:

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

    this.store.sendChatMessage(this.state.chatInput);
    this.setState({
      chatInput: ""
    });
  }

  onSubmitVideo(e) {

    e.preventDefault();

    const url = require('url');
    const query = url.parse(this.state.submitInput, true).query;
    const videoId = query.v;

    this.store.submitVideo(videoId);
  }

  render() {

    const users = this.state.channel.users.map(u => (
      <li key={ u } className="list-group-item">
        <h5><Badge color="success" pill>Ready</Badge> { u }</h5>
      </li>
    ));

    const chat = this.state.channel.chatMessages.length > 0 ? this.state.channel.chatMessages.map(msg => (
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
    
    const opts = {
      height: 1080 / 1920 * (containerWidth - 30),
      width: containerWidth,
      playerVars: {
        rel: 0,
        autoplay: 0,
        iv_load_policy: 3,
        modestbranding: 1
      }
    };

    const videoPlayer = this.state.channel.videoId ? (
      <YouTube
        id="player"
        videoId={ this.state.channel.videoId }
        opts={ opts }
        onReady={ this.onReady }
        onPlay={ this.onPlay }
        onStateChange={ this.onStateChange }
      />
    ) : (
      <div className="blankslate video-blankslate">
        <h3>New Channel Created!</h3>
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
                <Card className="videoInput">
                  <CardHeader>
                    <form onSubmit={ this.onSubmitVideo }>
                      <InputGroup>
                        <Input value={ this.state.submitInput } onChange={(e) => this.setState({ submitInput: e.target.value}) } required />
                        <InputGroupAddon addonType="append"><Button>Watch</Button></InputGroupAddon>
                      </InputGroup>
                    </form>
                  </CardHeader>
                </Card>
              </div>
            </div>
            <div className="row">
              <div className="col-md-4">
                <Card>
                  <CardHeader>Invite your friends</CardHeader>
                  <CardBody>
                    <Button color="danger btn-block" onClick={ this.onCopyToClipboard }>{ this.state.clipboard.buttonMessage }</Button>
                  </CardBody>
                </Card>
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
                        <Input value={ this.state.chatInput } onChange={(e) => this.setState({ chatInput: e.target.value}) } required />
                        <InputGroupAddon addonType="append" type="submit"><Button>Send</Button></InputGroupAddon>
                      </InputGroup>
                    </form>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </main>

        <input ref="copyInput" value={ `${ PUBLIC_URL }/channel/${ this.props.channelId }`} readOnly style={ this.state.clipboard.isCopying ? {} : { display: 'none' }} />
      </div>
    );
  }
}

export default VideoPlayer;
