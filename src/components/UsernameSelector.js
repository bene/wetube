import { Button, Card, CardBody, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import React, { Component } from 'react';

class UsernameSelector extends Component {

  constructor(props) {

    super(props);

    this.state = {
      username: localStorage.getItem('username') ? localStorage.getItem('username') : ""
    }

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(e) {
    this.setState({
      username: e.target.value
    });
  }

  onSubmit(e) {
    e.preventDefault();
    localStorage.setItem('username', this.state.username);
    this.props.history.push('/create');
  }

  render() {
    return (
      <div className="username-selector">
        <Card className="shadow">
          <CardBody>
            <div className="logo" />
            <form className="form-signin" onSubmit={ this.onSubmit }>
              <InputGroup size="lg">
                <InputGroupAddon addonType="prepend">@</InputGroupAddon>
                <Input placeholder="Enter your Username..." value={ this.state.username } onChange={ this.onChange } minLength="3" maxLength="24" required />
              </InputGroup>
              <br />
              <Button color="danger" size="lg" block>Get started</Button>
            </form>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default UsernameSelector;
