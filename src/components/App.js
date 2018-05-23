import '../index.css';

import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import React, { Component } from 'react';

import NotFound from './NotFound';
import UsernameSelector from './UsernameSelector';
import VideoPlayer from './VideoPlayer';

class App extends Component {

  constructor(props) {
    super(props);
    this.generateChannelId = this.generateChannelId.bind(this);
  }

  generateChannelId() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 12; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }

  render() {

    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={ UsernameSelector }/>
          <Route exact path="/create" render={() => {
            const channelId = this.generateChannelId();
            return <Redirect to={ `/channel/${channelId}` } />
          }} />
          <Route exact path="/channel/:id" render={(props) => {

            const username = localStorage.getItem('username');

            if (props.match.params.id.length !== 12) {
                return <NotFound />;
            }

            if (!username || username.length < 3) {
              return <UsernameSelector />
            } else {
              props.username = username;
              props.channelId = props.match.params.id;
              return <VideoPlayer {...props} />;
            }
          }} />
          <Route component={ NotFound } />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
