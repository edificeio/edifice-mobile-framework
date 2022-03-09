import React, { useEffect, useRef } from 'react';

const imports = {
  'days-monday': import(`../../../assets/images/days/monday.svg`),
  'days-tuesday': import(`../../../assets/images/days/tuesday.svg`),
  'days-wednesday': import(`../../../assets/images/days/wednesday.svg`),
  'days-thursday': import(`../../../assets/images/days/thursday.svg`),
  'days-friday': import(`../../../assets/images/days/friday.svg`),
  'days-saturday': import(`../../../assets/images/days/saturday.svg`),
  'empty-blog': import(`../../../assets/images/empty-screen/empty-blog.svg`),
  'empty-content': import(`../../../assets/images/empty-screen/empty-content.svg`),
  'empty-conversation': import(`../../../assets/images/empty-screen/empty-conversation.svg`),
  'empty-evaluations': import(`../../../assets/images/empty-screen/empty-evaluations.svg`),
  'empty-hammock': import(`../../../assets/images/empty-screen/empty-hammock.svg`),
  'empty-homework': import(`../../../assets/images/empty-screen/empty-homework.svg`),
  'empty-light': import(`../../../assets/images/empty-screen/empty-light.svg`),
  'empty-search': import(`../../../assets/images/empty-screen/empty-search.svg`),
  'empty-timeline': import(`../../../assets/images/empty-screen/empty-timeline.svg`),
  'empty-trash': import(`../../../assets/images/empty-screen/empty-trash.svg`),
  'empty-viesco': import(`../../../assets/images/empty-screen/empty-viesco.svg`),
  'empty-workspace': import(`../../../assets/images/empty-screen/empty-workspace.svg`),
  'onboarding-1': import(`../../../assets/images/onboarding/onboarding_1.svg`),
  'onboarding-2': import(`../../../assets/images/onboarding/onboarding_2.svg`),
  'onboarding-3': import(`../../../assets/images/onboarding/onboarding_3.svg`),
  'onboarding-4': import(`../../../assets/images/onboarding/onboarding_4.svg`),
};

export const NamedSVG = ({ name, ...rest }): JSX.Element | null => {
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
