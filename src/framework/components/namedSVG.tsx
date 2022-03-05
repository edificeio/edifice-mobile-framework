import React, { useEffect, useRef } from 'react';

export const NamedSVG = ({ name, ...rest }): JSX.Element | null => {
  const ImportedSVGRef = useRef<any>();
  const [loading, setLoading] = React.useState(false);
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

  useEffect((): void => {
    setLoading(true);
    const importSVG = async (): Promise<void> => {
      try {
        ImportedSVGRef.current = (await imports[name]).default;
        /*switch (name) {
          case 'days-monday':
            ImportedSVGRef.current = (await import(`../../../assets/images/days/monday.svg`)).default;
            break;
          case 'days-tuesday':
            ImportedSVGRef.current = (await import(`../../../assets/images/days/tuesday.svg`)).default;
            break;
          case 'days-wednesday':
            ImportedSVGRef.current = (await import(`../../../assets/images/days/wednesday.svg`)).default;
            break;
          case 'days-thursday':
            ImportedSVGRef.current = (await import(`../../../assets/images/days/thursday.svg`)).default;
            break;
          case 'days-friday':
            ImportedSVGRef.current = (await import(`../../../assets/images/days/friday.svg`)).default;
            break;
          case 'days-saturday':
            ImportedSVGRef.current = (await import(`../../../assets/images/days/saturday.svg`)).default;
            break;
          case 'empty-blog':
            ImportedSVGRef.current = (await import(`../../../assets/images/empty-screen/empty-blog.svg`)).default;
            break;
          case 'empty-content':
            ImportedSVGRef.current = (await import(`../../../assets/images/empty-screen/empty-content.svg`)).default;
            break;
          case 'empty-conversation':
            ImportedSVGRef.current = (await import(`../../../assets/images/empty-screen/empty-conversation.svg`)).default;
            break;
          case 'empty-evaluations':
            ImportedSVGRef.current = (await import(`../../../assets/images/empty-screen/empty-evaluations.svg`)).default;
            break;
          case 'empty-hammock':
            ImportedSVGRef.current = (await import(`../../../assets/images/empty-screen/empty-hammock.svg`)).default;
            break;
          case 'empty-homework':
            ImportedSVGRef.current = (await import(`../../../assets/images/empty-screen/empty-homework.svg`)).default;
            break;
          case 'empty-light':
            ImportedSVGRef.current = (await import(`../../../assets/images/empty-screen/empty-light.svg`)).default;
            break;
          case 'empty-search':
            ImportedSVGRef.current = (await import(`../../../assets/images/empty-screen/empty-search.svg`)).default;
            break;
          case 'empty-timeline':
            ImportedSVGRef.current = (await import(`../../../assets/images/empty-screen/empty-timeline.svg`)).default;
            break;
          case 'empty-trash':
            ImportedSVGRef.current = (await import(`../../../assets/images/empty-screen/empty-trash.svg`)).default;
            break;
          case 'empty-viesco':
            ImportedSVGRef.current = (await import(`../../../assets/images/empty-screen/empty-viesco.svg`)).default;
            break;
          case 'empty-workspace':
            ImportedSVGRef.current = (await import(`../../../assets/images/empty-screen/empty-workspace.svg`)).default;
            break;
          case 'onboarding-1':
            ImportedSVGRef.current = (await import(`../../../assets/images/onboarding/onboarding_1.svg`)).default;
            break;
          case 'onboarding-2':
            ImportedSVGRef.current = (await import(`../../../assets/images/onboarding/onboarding_2.svg`)).default;
            break;
          case 'onboarding-3':
            ImportedSVGRef.current = (await import(`../../../assets/images/onboarding/onboarding_3.svg`)).default;
            break;
          case 'onboarding-4':
            ImportedSVGRef.current = (await import(`../../../assets/images/onboarding/onboarding_4.svg`)).default;
            break;
        }*/
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
