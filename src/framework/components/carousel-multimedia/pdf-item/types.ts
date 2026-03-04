export interface PdfItemProps {
  hideNavBar: () => void;
  isNavBarVisible: boolean;
  isShown: boolean;
  setIsCarouselSwipeEnabled: (isEnabled: boolean) => void;
  setIsPdfError: (isError: boolean) => void;
  source: { uri?: string };
  toggleNavBar: () => void;
}
