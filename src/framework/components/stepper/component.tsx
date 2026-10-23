import * as React from 'react';
import { ColorValue, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg, SvgIconName } from '~/framework/components/picture';
import { BodyBoldText } from '~/framework/components/text';

import styles from './styles';

export type StepperStepProps = React.PropsWithChildren<{
  title: string;
  color: ColorValue;
  icon?: SvgIconName;
}>;

export type StepperProps = {
  children: React.ReactNode;
  hideLastLine?: boolean;
};

interface StepperContextValue {
  hideLine: boolean;
}

const StepperContext = React.createContext<StepperContextValue>({ hideLine: false });
const HIDDEN_LINE: StepperContextValue = { hideLine: true };

function Step({ children, color, icon, title }: Readonly<StepperStepProps>) {
  const { hideLine } = React.useContext(StepperContext);
  return (
    <View style={styles.step}>
      <View style={styles.track}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          {icon ? (
            <Svg
              name={icon}
              fill={theme.palette.grey.darkness}
              width={UI_SIZES.elements.icon.xsmall}
              height={UI_SIZES.elements.icon.xsmall}
            />
          ) : null}
        </View>
        {hideLine ? null : <View style={[styles.stepLine, { backgroundColor: color }]} />}
      </View>
      <View style={styles.stepContainer}>
        <View style={styles.header}>
          <BodyBoldText style={styles.title}>{title}</BodyBoldText>
        </View>
        {children}
      </View>
    </View>
  );
}

export function Stepper({ children, hideLastLine = false }: Readonly<StepperProps>) {
  const steps = React.Children.toArray(children);
  return (
    <View>
      {steps.map((step, index) => {
        const isLastStep = index === steps.length - 1;
        return hideLastLine && isLastStep ? (
          <StepperContext.Provider key={React.isValidElement(step) ? step.key : index} value={HIDDEN_LINE}>
            {step}
          </StepperContext.Provider>
        ) : (
          step
        );
      })}
    </View>
  );
}

Stepper.Step = Step;
