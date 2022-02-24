import style from 'glamorous-native';
import I18n from 'i18n-js';
import * as React from 'react';
import { View, SafeAreaView, ScrollView, Platform } from 'react-native';

import { FakeHeader_Container, HeaderAction, HeaderCenter, HeaderLeft, FakeHeader_Row, HeaderTitle_Style } from '~/framework/components/header';
import { PFLogo } from '~/framework/components/pfLogo';
import { TextLightItalic } from '~/framework/components/text';
import { FlatButton } from '~/ui';

// TYPES ---------------------------------------------------------------------------

export interface IFederatedAccountPageEventProps {
  onLink(): Promise<void>;
}
export type IFederatedAccountPageProps = IFederatedAccountPageEventProps & { navigation: any };

// Forgot Page Component -------------------------------------------------------------

export class FederatedAccountPage extends React.PureComponent<IFederatedAccountPageProps, object> {
  public render() {
    const { onLink, navigation } = this.props;

    return (
      <>
        <FakeHeader_Container>
          <FakeHeader_Row>
            <HeaderLeft>
              <HeaderAction
                iconName={Platform.OS === 'ios' ? 'chevron-left1' : 'back'}
                iconSize={24}
                onPress={() => navigation.goBack()}
              />
            </HeaderLeft>
            <HeaderCenter>
              <HeaderTitle_Style>{I18n.t('federatedAccount-title')}</HeaderTitle_Style>
            </HeaderCenter>
          </FakeHeader_Row>
        </FakeHeader_Container>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
          <FormPage>
            <FormWrapper>
              <ScrollView alwaysBounceVertical={false} contentContainerStyle={{ flex: 1, justifyContent: 'center' }}>
                <FormContainer>
                  <LogoWrapper>
                    <PFLogo />
                  </LogoWrapper>
                  <View style={{ flexGrow: 4, justifyContent: 'flex-start' }}>
                    <TextLightItalic>{I18n.t('federatedAccount-instructions')}</TextLightItalic>
                    <TextLightItalic style={{ marginLeft: 25, marginTop: 20 }}>
                      {I18n.t('federatedAccount-instructions-details')}
                    </TextLightItalic>
                  </View>
                  <View
                    style={{
                      alignItems: 'center',
                      flexGrow: 1,
                      justifyContent: 'center',
                      marginTop: 40,
                    }}>
                    <FlatButton onPress={() => onLink()} title={I18n.t('federatedAccount-openLink')} />
                  </View>
                </FormContainer>
              </ScrollView>
            </FormWrapper>
          </FormPage>
        </SafeAreaView>
      </>
    );
  }
}

const FormPage = style.view({
  backgroundColor: '#ffffff',
  flex: 1,
});
const FormWrapper = style.view({ flex: 1 });
const FormContainer = style.view({
  height: '100%',
  margin: 0,
  padding: 40,
  paddingVertical: 20,
});
const LogoWrapper = style.view({
  flexGrow: 2,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 20,
});
