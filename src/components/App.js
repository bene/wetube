import '../index.css';

import { BrowserRouter, Route, Switch } from 'react-router-dom';
import React, { Component } from 'react';

import ChannelCreator from './ChannelCreator';
import NotFound from './NotFound';
import VideoPlayer from './VideoPlayer';

class App extends Component {
  render() {

    const username = localStorage.getItem('username') ? localStorage.getItem('username') : ""

    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={ ChannelCreator } />
          <Route exact path="/channel/:id" render={ (props) => {

            if (props.match.params.id.length !== 12) {
                return <NotFound />;
            }

            if (username.length < 3) {
              return <h3>Invalid Username</h3>
            } else {
              props.username = username;
              props.channelId = props.match.params.id;
              return <VideoPlayer {...props} />;
            }
          }} />
          <Route component={ ChannelCreator } />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
