import React from 'react';
import { Button } from 'react-bootstrap';

export class WideButton extends React.Component {
  render() {
    return (
      <Button block variant="info" {...this.props}>
        {this.props.children}
      </Button>
    );
  }
}
