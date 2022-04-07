/**
 * NamedSVG
 *
 * Display a SVG file from its name.
 *
 * To add a SVG in the app, beware add its path to the "imports" list below.
 * ToDo : make this list automatically computed.
 */
import React, { useEffect, useRef } from 'react';
import { SvgProps } from 'react-native-svg';


const imports = {
  'days-monday': import(`ASSETS/images/days/monday.svg`),
  'days-tuesday': import(`ASSETS/images/days/tuesday.svg`),
  'days-wednesday': import(`ASSETS/images/days/wednesday.svg`),
  'days-thursday': import(`ASSETS/images/days/thursday.svg`),
  'days-friday': import(`ASSETS/images/days/friday.svg`),
  'days-saturday': import(`ASSETS/images/days/saturday.svg`),
  'empty-blog': import(`ASSETS/images/empty-screen/empty-blog.svg`),
  'empty-content': import(`ASSETS/images/empty-screen/empty-content.svg`),
  'empty-conversation': import(`ASSETS/images/empty-screen/empty-conversation.svg`),
  'empty-evaluations': import(`ASSETS/images/empty-screen/empty-evaluations.svg`),
  'empty-hammock': import(`ASSETS/images/empty-screen/empty-hammock.svg`),
  'empty-homework': import(`ASSETS/images/empty-screen/empty-homework.svg`),
  'empty-light': import(`ASSETS/images/empty-screen/empty-light.svg`),
  'empty-search': import(`ASSETS/images/empty-screen/empty-search.svg`),
  'empty-timeline': import(`ASSETS/images/empty-screen/empty-timeline.svg`),
  'empty-trash': import(`ASSETS/images/empty-screen/empty-trash.svg`),
  'empty-viesco': import(`ASSETS/images/empty-screen/empty-viesco.svg`),
  'empty-workspace': import(`ASSETS/images/empty-screen/empty-workspace.svg`),
  'onboarding-0': import(`ASSETS/images/onboarding/onboarding_0.svg`),
  'onboarding-1': import(`ASSETS/images/onboarding/onboarding_1.svg`),
  'onboarding-2': import(`ASSETS/images/onboarding/onboarding_2.svg`),
  'onboarding-3': import(`ASSETS/images/onboarding/onboarding_3.svg`),
};

export interface NamedSVGProps extends SvgProps {
  name: string;
}

export const NamedSVG = ({ name, ...rest }: NamedSVGProps): JSX.Element | null => {
  const ImportedSVGRef = useRef<any>();
  const [loading, setLoading] = React.useState(false);
  useEffect((): void => {
    setLoading(true);
    const importSVG = async (): Promise<void> => {
      try {
        ImportedSVGRef.current = (await imports[name]).default;
      } catch (err) {
        throw err;
      } finally {
        setLoading(false);
      }
    };
    importSVG();
  }, [name]);
  if (!loading && ImportedSVGRef.current) {
    const { current: ImportedSVG } = ImportedSVGRef;
    return <ImportedSVG {...rest} />;
  }
  return null;
};

export default NamedSVG;