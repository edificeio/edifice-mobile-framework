export interface PdfItemProps {
  hideNavBar: () => void;
  isNavBarVisible: boolean;
  isPdfLoadTimeout: boolean;
  isShown: boolean;
  setIsCarouselSwipeEnabled: (isEnabled: boolean) => void;
  setIsPdfError: (isError: boolean) => void;
  setIsPdfLoadTimeout: (isTimeout: boolean) => void;
  source: { uri?: string };
  toggleNavBar: () => void;
}
