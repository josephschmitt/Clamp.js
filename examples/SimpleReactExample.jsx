import React, { Component } from React;
import clamp from 'clamp.js';

class MyComponent extends Component {
  componentDidMount() {
    clamp(this._ref, { clamp: 3, window: window });
  }

  render() {
    return(<div ref={r => this._ref = r}>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Incidunt atque est tempore dicta doloremque esse illo, veniam voluptatibus. Deleniti, aut, quaerat pariatur quibusdam saepe asperiores. At ad iste nihil dolore.
    </div>);
  }
}
