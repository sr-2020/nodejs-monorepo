import React from 'react';
import { Hacking } from '@alice/sr2020-common/models/sr2020-character.model';
import { Accordion, Table } from 'react-bootstrap';
import { WideButton } from '@alice/sr2020-admin-ui/app/wide-button';

export class HackerCharactersStats extends React.Component<{ hacking: Hacking }> {
  render() {
    return (
      <Accordion>
        <Accordion.Toggle as={WideButton} eventKey="0">
          Хакерские характеристики
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="0">
          <Table size="sm">
            <tbody>
              <tr>
                <th>Бонус к резонансу для контроля</th>
                <td>hacking.resonanceForControlBonus</td>
                <td>{this.props.hacking.resonanceForControlBonus}</td>
              </tr>
              <tr>
                <th>Максимальное время на хосте</th>
                <td>hacking.maxTimeAtHost</td>
                <td>{this.props.hacking.maxTimeAtHost}</td>
              </tr>
              <tr>
                <th>Скорость входа на хост</th>
                <td>hacking.hostEntrySpeed</td>
                <td>{this.props.hacking.hostEntrySpeed}</td>
              </tr>
              <tr>
                <th>Конверсия атаки</th>
                <td>hacking.conversionAttack</td>
                <td>{this.props.hacking.conversionAttack}</td>
              </tr>
              <tr>
                <th>Конверсия файрвола</th>
                <td>hacking.conversionFirewall</td>
                <td>{this.props.hacking.conversionFirewall}</td>
              </tr>
              <tr>
                <th>Конверсия слизи</th>
                <td>hacking.conversionSleaze</td>
                <td>{this.props.hacking.conversionSleaze}</td>
              </tr>
              <tr>
                <th>Конверсия датапроцессинга</th>
                <td>hacking.conversionDataprocessing</td>
                <td>{this.props.hacking.conversionDataprocessing}</td>
              </tr>
              <tr>
                <th>Число администрируемых хостов</th>
                <td>hacking.adminHostNumber</td>
                <td>{this.props.hacking.adminHostNumber}</td>
              </tr>
              <tr>
                <th>Уровень спрайтов</th>
                <td>hacking.spriteLevel</td>
                <td>{this.props.hacking.spriteLevel}</td>
              </tr>
              <tr>
                <th>Дополнительные спрайты</th>
                <td>hacking.additionalSprites</td>
                <td>{this.props.hacking.additionalSprites}</td>
              </tr>
              <tr>
                <th>Дополнительные бекдоры</th>
                <td>hacking.additionalBackdoors</td>
                <td>{this.props.hacking.additionalBackdoors}</td>
              </tr>
              <tr>
                <th>Время жизни бекдоров</th>
                <td>hacking.backdoorTtl</td>
                <td>{this.props.hacking.backdoorTtl}</td>
              </tr>
              <tr>
                <th>Дополнительные запросы к контролю</th>
                <td>hacking.additionalRequests</td>
                <td>{this.props.hacking.additionalRequests}</td>
              </tr>
              <tr>
                <th>Сопротивление фейдингу</th>
                <td>hacking.fadingResistance</td>
                <td>{this.props.hacking.fadingResistance}</td>
              </tr>
              <tr>
                <th>Сопротивление фейдингу для компиляции</th>
                <td>hacking.compilationFadingResistance</td>
                <td>{this.props.hacking.compilationFadingResistance}</td>
              </tr>
              <tr>
                <th>Сопротивление биофидбеку</th>
                <td>hacking.biofeedbackResistance</td>
                <td>{this.props.hacking.biofeedbackResistance}</td>
              </tr>
              <tr>
                <th>Сопротивление вэриансу</th>
                <td>hacking.varianceResistance</td>
                <td>{this.props.hacking.varianceResistance}</td>
              </tr>
            </tbody>
          </Table>
        </Accordion.Collapse>
      </Accordion>
    );
  }
}
