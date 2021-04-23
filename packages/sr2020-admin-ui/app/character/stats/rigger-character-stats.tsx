import React from 'react';
import { Drones, Rigging } from '@alice/sr2020-common/models/sr2020-character.model';
import { Accordion, Table } from 'react-bootstrap';
import { WideButton } from '@alice/sr2020-admin-ui/app/components/wide-button';

export class RiggerCharacterStats extends React.Component<{ drones: Drones; rigging: Rigging }> {
  render() {
    return (
      <Accordion>
        <Accordion.Toggle as={WideButton} eventKey="0">
          Риггерство
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="0">
          <Table size="sm">
            <tbody>
              <tr>
                <th>Модификатор урона при выходе</th>
                <td>drones.feedbackModifier</td>
                <td>{this.props.drones.feedbackModifier}</td>
              </tr>
              <tr>
                <th>Максимальная сложность дрона</th>
                <td>drones.maxDifficulty</td>
                <td>{this.props.drones.maxDifficulty}</td>
              </tr>
              <tr>
                <th>Максимальное время в дроне</th>
                <td>drones.maxTimeInside</td>
                <td>{this.props.drones.maxTimeInside}</td>
              </tr>
              <tr>
                <th>Время восстановления после</th>
                <td>drones.recoveryTime</td>
                <td>{this.props.drones.recoveryTime}</td>
              </tr>
              <tr>
                <th>Навык управления медицинскими дронами</th>
                <td>drones.medicraftBonus</td>
                <td>{this.props.drones.medicraftBonus}</td>
              </tr>
              <tr>
                <th>Навык управления автодоком</th>
                <td>drones.autodocBonus</td>
                <td>{this.props.drones.autodocBonus}</td>
              </tr>
              <tr>
                <th>Навык управления летающими дронами</th>
                <td>drones.aircraftBonus</td>
                <td>{this.props.drones.aircraftBonus}</td>
              </tr>
              <tr>
                <th>Навык управления наземными дронами</th>
                <td>drones.groundcraftBonus</td>
                <td>{this.props.drones.groundcraftBonus}</td>
              </tr>
              <tr>
                <th>Навык ремонта дронов</th>
                <td>drones.recoverySkill</td>
                <td>{this.props.drones.recoverySkill}</td>
              </tr>
              <tr>
                <th>Может работать с биоваром</th>
                <td>rigging.canWorkWithBioware</td>
                <td>{this.props.rigging.canWorkWithBioware}</td>
              </tr>
              <tr>
                <th>Способность ставить импланты</th>
                <td>rigging.implantsBonus</td>
                <td>{this.props.rigging.implantsBonus}</td>
              </tr>
              <tr>
                <th>Способность ставить моды</th>
                <td>rigging.tuningBonus</td>
                <td>{this.props.rigging.tuningBonus}</td>
              </tr>
              <tr>
                <th>Способность рипомена</th>
                <td>rigging.repomanBonus</td>
                <td>{this.props.rigging.repomanBonus}</td>
              </tr>
            </tbody>
          </Table>
        </Accordion.Collapse>
      </Accordion>
    );
  }
}
