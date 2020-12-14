import React from 'react';

import './app.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useToasts } from 'react-toast-notifications';
import { Container, Tab, Tabs } from 'react-bootstrap';
import { CharacterPage } from '@alice/sr2020-admin-ui/app/character/character-page';
import { Redirect, Route, useHistory, useLocation } from 'react-router-dom';
import { QrPage } from '@alice/sr2020-admin-ui/app/qr/qr-page';
import { GlobalActionsPage } from '@alice/sr2020-admin-ui/app/global/global-actions';

export function App() {
  const { addToast } = useToasts();
  const history = useHistory();
  const tab = useLocation().pathname.split('/')[1] || 'character';
  const setPage = (page: string) => history.push('/' + page);

  return (
    <div className="app">
      <Container>
        <Tabs defaultActiveKey={tab} onSelect={setPage}>
          <Tab eventKey="character" title="Персонаж" />
          <Tab eventKey="qr" title="QR-код" />
          <Tab eventKey="global" title="Глобальные действия" />
        </Tabs>
        <Route path="/" exact render={() => <Redirect to="/character" />} />
        <Route path="/character" exact render={() => <CharacterPage addToast={addToast} />} />
        <Route path="/qr" exact render={() => <QrPage addToast={addToast} />} />
        <Route path="/global" exact render={() => <GlobalActionsPage addToast={addToast} />} />
      </Container>
      {/* END: routes */}
    </div>
  );
}

export default App;
