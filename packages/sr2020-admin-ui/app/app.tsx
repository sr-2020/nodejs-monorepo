import React from 'react';

import './app.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useToasts } from 'react-toast-notifications';
import { Container } from 'react-bootstrap';
import { CharacterPage } from '@alice/sr2020-admin-ui/app/character/character-page';
import { Link, Route } from 'react-router-dom';

export function App() {
  const { addToast } = useToasts();
  return (
    <div className="app">
      <Container>
        <CharacterPage id="51614" addToast={addToast} />
      </Container>

      {/* START: routes */}
      {/* These routes and navigation have been generated for you */}
      {/* Feel free to move and update them to fit your needs */}
      <br />
      <hr />
      <br />
      <div role="navigation">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/page-2">Page 2</Link>
          </li>
        </ul>
      </div>
      <Route
        path="/"
        exact
        render={() => (
          <div>
            This is the generated root route. <Link to="/page-2">Click here for page 2.</Link>
          </div>
        )}
      />
      <Route
        path="/page-2"
        exact
        render={() => (
          <div>
            <Link to="/">Click here to go back to root page.</Link>
          </div>
        )}
      />
      {/* END: routes */}
    </div>
  );
}

export default App;
