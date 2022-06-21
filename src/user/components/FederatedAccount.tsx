import styled from '@emotion/native';
import I18n from 'i18n-js';
import * as React from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';

import theme from '~/app/theme';
import { PageView } from '~/framework/components/page';
import { PFLogo } from '~/framework/components/pfLogo';
import { TextLightItalic } from '~/framework/components/text';
import { FlatButton } from '~/ui/FlatButton';

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
      <PageView
        navigation={navigation}
        navBarWithBack={{
          title: I18n.t('federatedAccount-title'),
        }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.ui.background.card }}>
          <FormPage>
            <FormWrapper>
              <ScrollView
                alwaysBounceVertical={false}
                overScrollMode="never"
                contentContainerStyle={{ flex: 1, justifyContent: 'center' }}>
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
      </PageView>
    );
  }
}

const FormPage = styled.View({
  backgroundColor: theme.ui.background.card,
  flex: 1,
});
const FormWrapper = styled.View({ flex: 1 });
const FormContainer = styled.View({
  height: '100%',
  margin: 0,
  padding: 40,
  paddingVertical: 20,
});
const LogoWrapper = styled.View({
  flexGrow: 2,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 20,
});
