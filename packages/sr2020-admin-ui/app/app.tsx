import React from 'react';

import './app.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useToasts } from 'react-toast-notifications';
import { Container, Tab, Tabs } from 'react-bootstrap';
import { CharacterPage } from '@alice/sr2020-admin-ui/app/character/character-page';
import { Link, Route } from 'react-router-dom';
import { QrPage } from '@alice/sr2020-admin-ui/app/qr/qr-page';
import { GlobalActionsPage } from '@alice/sr2020-admin-ui/app/global/global-actions';

export function App() {
  const { addToast } = useToasts();
  return (
    <div className="app">
      <Container>
        <Tabs defaultActiveKey="home" id="uncontrolled-tab-example">
          <Tab eventKey="home" title="Персонаж">
            <CharacterPage id="51614" addToast={addToast} />
          </Tab>
          <Tab eventKey="profile" title="QR-код">
            <QrPage id="1" addToast={addToast} />
          </Tab>
          <Tab eventKey="contact" title="Глобальные действия">
            <GlobalActionsPage addToast={addToast} />
          </Tab>
        </Tabs>
      </Container>
      {/* START: routes */}
      {/* These routes and navigation have been generated for you */}
      {/* Feel free to move and update them to fit your needs */}
      <Route path="/" exact render={() => <div></div>} />
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
