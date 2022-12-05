import I18n from 'i18n-js';
import * as React from 'react';
import { ImageSourcePropType, TouchableOpacity, View, ViewStyle } from 'react-native';

import { getItemJson, removeItemJson, setItemJson } from '~/framework/util/storage';
import { IconButton } from '~/ui/IconButton';

import { Image } from '../util/media';
import { ActionButton } from './action-button';
import { Card, InfoCard } from './card';
import { UI_SIZES } from './constants';
import { CaptionText, SmallBoldText, SmallText } from './text';
import { Toggle } from './toggle';

export interface IInfoBubbleProps {
  infoText: string;
  infoBubbleType: 'floating' | 'regular';
  infoBubbleId: string;
  infoTitle?: string;
  infoImage?: ImageSourcePropType;
  style?: ViewStyle;
}

export interface IInfoBubbleState {
  isAcknowledged: boolean; // determines whether the InfoBubble is displayed
  acknowledgeToggle: boolean; // determines whether the Toggle is ON/OFF (regular type)
  displayToggle: boolean; // determines whether the content is displayed (floating type)
}

const computeStorageId = (infoBubbleId: string) => `infoBubbleAck-${infoBubbleId}`;

export class InfoBubble extends React.PureComponent<IInfoBubbleProps, IInfoBubbleState> {
  // DECLARATIONS =================================================================================

  state: IInfoBubbleState = {
    isAcknowledged: true,
    acknowledgeToggle: false,
    displayToggle: false,
  };

  // RENDER =======================================================================================

  public render() {
    const { infoBubbleType } = this.props;
    const { isAcknowledged } = this.state;
    const isRegular = infoBubbleType === 'regular';
    const isFloating = infoBubbleType === 'floating';
    return isAcknowledged ? null : isRegular ? this.renderRegularInfoBubble() : isFloating ? this.renderFloatingInfoBubble() : null;
  }

  renderFloatingInfoBubble() {
    const { infoText, infoTitle, infoImage, style } = this.props;
    const { displayToggle } = this.state;
    const textContainerWidth = UI_SIZES.screen.width * 0.9;
    const infoBubbleRightMargin = UI_SIZES.screen.width * 0.05;
    const infoBubbleDiameter = 38;
    const infoBubbleRadius = infoBubbleDiameter / 2;
    const iconSize = infoBubbleDiameter * 0.7;
    return (
      <Card
        style={[
          {
            width: displayToggle ? textContainerWidth : undefined,
            borderRadius: infoBubbleRadius,
            position: 'absolute',
            right: infoBubbleRightMargin,
            bottom: 0,
            paddingHorizontal: undefined,
            paddingVertical: undefined,
          },
          style,
        ]}>
        {displayToggle ? (
          <View
            style={{
              flex: 1,
              padding: UI_SIZES.spacing.medium,
              alignItems: 'center',
            }}>
            {infoTitle ? (
              <SmallBoldText style={{ textAlign: 'left', marginBottom: UI_SIZES.spacing.medium }}>{infoTitle}</SmallBoldText>
            ) : null}
            {infoImage ? (
              <Image
                source={infoImage}
                resizeMode="contain"
                style={{ height: 120, width: 120, marginBottom: UI_SIZES.spacing.medium }}
              />
            ) : null}
            <SmallText style={{ textAlign: 'left', marginBottom: UI_SIZES.spacing.medium }}>{infoText}</SmallText>
            <ActionButton text={I18n.t('common.infoBubble-understood')} action={() => this.doAcknowledge(true)} />
          </View>
        ) : null}
        <TouchableOpacity
          onPress={() => this.setState({ displayToggle: !displayToggle })}
          style={displayToggle ? { position: 'absolute', bottom: 0, right: 0 } : undefined}>
          <IconButton
            iconName="interrogation-mark"
            iconSize={iconSize}
            buttonStyle={{
              height: infoBubbleDiameter,
              width: infoBubbleDiameter,
              borderRadius: infoBubbleRadius,
            }}
          />
        </TouchableOpacity>
      </Card>
    );
  }

  renderRegularInfoBubble() {
    const { infoText, style } = this.props;
    const { acknowledgeToggle } = this.state;
    return (
      <InfoCard style={style}>
        <SmallText style={{ textAlign: 'left', marginBottom: UI_SIZES.spacing.medium }}>{infoText}</SmallText>
        <View style={{ flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center' }}>
          <CaptionText style={{ marginRight: UI_SIZES.spacing.small }}>{I18n.t('common.infoBubble-doNotShow')}</CaptionText>
          <Toggle checked={acknowledgeToggle} onCheckChange={() => this.doAcknowledge(!acknowledgeToggle)} />
        </View>
      </InfoCard>
    );
  }

  // LIFECYCLE ====================================================================================

  constructor(props: IInfoBubbleProps) {
    super(props);
    this.doVerifyIfAcknowledged();
  }

  // METHODS ======================================================================================

  async doVerifyIfAcknowledged() {
    const { infoBubbleId } = this.props;
    const asyncStorageKey = computeStorageId(infoBubbleId);
    try {
      const res = await getItemJson(asyncStorageKey);
      const isAcknowledged = !!res;
      this.setState({ isAcknowledged });
    } catch (e) {
      // ToDo: Error handling
    }
  }

  async doAcknowledge(acknowledge: boolean) {
    const { infoBubbleId, infoBubbleType } = this.props;
    const asyncStorageKey = computeStorageId(infoBubbleId);
    const isRegular = infoBubbleType === 'regular';
    const isFloating = infoBubbleType === 'floating';
    try {
      acknowledge ? await setItemJson(asyncStorageKey, true) : await removeItemJson(asyncStorageKey);
      isFloating ? this.setState({ isAcknowledged: true }) : isRegular ? this.setState({ acknowledgeToggle: acknowledge }) : null;
    } catch (e) {
      // ToDo: Error handling
    }
  }
}
