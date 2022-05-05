import I18n from 'i18n-js';
import * as React from 'react';
import { View, StyleSheet } from 'react-native';

import { Text } from '~/framework/components/text';
import ButtonOk from '~/ui/ConfirmDialog/buttonOk';
import { ModalBox } from '~/ui/Modal';

export default class NotificationsModal extends React.PureComponent<
  { modal: boolean; onClose?: any; data: any },
  { visible: boolean }
> {
  constructor(props) {
    super(props);
    this.state = {
      visible: props.modal,
    };
  }

  onClose = () => {
    this.setState({
      visible: false,
    });
    this.props.onClose();
  };

  public render() {
    const data = [
      {
        name: 'BABIN Loïc',
        events: [
          {
            type: 'absences non justifiées',
            color: 'red',
            occurrences: [
              {
                primaryText: '17/01/21',
                secondaryText: '8:30 - 9:25',
              },
            ],
          },
        ],
      },
      {
        name: 'BABIN Noémie',
        events: [
          {
            type: 'retard',
            color: 'purple',
            occurrences: [
              {
                primaryText: '17/01/21',
                secondaryText: '8:30 - 9:25 - 5mn',
              },
            ],
          },
        ],
      },
    ];

    return (
      <ModalBox backdropOpacity={0.5} isVisible={this.state.visible}>
        <View style={style.modalContainerView}>
          <View style={style.modalContentView}>
            <Text style={style.modalTitle}>{I18n.t('viesco-notifications')}</Text>
            {data.map(child => (
              <View>
                <Text style={style.bold}>{child.name}</Text>
                <View style={style.modalSubsection}>
                  {child.events.map(event => (
                    <>
                      <Text style={style.eventTitle}>{event.type}</Text>
                      {event.occurrences.map(occ => (
                        <Text style={{ color: event.color }}>
                          ▪ <Text style={style.bold}>{occ.primaryText}</Text> - {occ.secondaryText}
                        </Text>
                      ))}
                    </>
                  ))}
                </View>
              </View>
            ))}
            <ButtonOk label={I18n.t('common-ok')} onPress={this.onClose} />
          </View>
        </View>
      </ModalBox>
    );
  }
}

const style = StyleSheet.create({
  bold: {
    fontWeight: 'bold',
  },
  modalTitle: {
    marginBottom: 10,
    fontSize: 20,
  },
  modalSubsection: {
    paddingLeft: 15,
    marginBottom: 15,
  },
  eventTitle: {
    textTransform: 'uppercase',
    color: 'grey',
  },
  modalContainerView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentView: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 25,
    alignItems: 'stretch',
  },
});
