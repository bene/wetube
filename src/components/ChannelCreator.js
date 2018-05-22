import React, { Component } from 'react';

class ChannelCreator extends Component {

  constructor(props) {
    super(props);

    this.state = {
      username: localStorage.getItem('username') ? localStorage.getItem('username') : ""
    }

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(e) {

    e.preventDefault();


  }

  render() {
    return (
      <div>
      <h1>Test</h1>
      </div>
    );
  }
}

export default ChannelCreator;
