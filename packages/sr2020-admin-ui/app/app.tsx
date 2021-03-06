import React from 'react';

import './app.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useToasts } from 'react-toast-notifications';
import { Container, Tab, Tabs } from 'react-bootstrap';
import { CharacterPage } from '@alice/sr2020-admin-ui/app/character/character-page';
import { Redirect, Route, useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { QrPage } from '@alice/sr2020-admin-ui/app/qr/qr-page';
import { GlobalActionsPage } from '@alice/sr2020-admin-ui/app/global/global-actions';
import { authToken } from '@alice/sr2020-admin-ui/app/api/models-manager';

export function App() {
  if (!authToken()) {
    window.location.href = `https://web.evarun.ru/login?externalUrl=${encodeURIComponent(window.location.href)}`;
  }

  const { addToast } = useToasts();
  const history = useHistory();
  const maybeCharacterId = useRouteMatch<{ id: string }>('/character/:id');
  const maybeQrId = useRouteMatch<{ id: string }>('/qr/:id');
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
        <Route path="/character/:id" exact render={() => <CharacterPage idToLoad={maybeCharacterId.params.id} addToast={addToast} />} />
        <Route path="/qr" exact render={() => <QrPage addToast={addToast} />} />
        <Route path="/qr/:id" exact render={() => <QrPage idToLoad={maybeQrId.params.id} addToast={addToast} />} />
        <Route path="/global" exact render={() => <GlobalActionsPage addToast={addToast} />} />
      </Container>
      {/* END: routes */}
    </div>
  );
}

export default App;
