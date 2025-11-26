export interface PdfItemProps {
  hideNavBar: () => void;
  isNavBarVisible: boolean;
  setIsCarouselSwipeEnabled: (isEnabled: boolean) => void;
  source: { uri?: string };
  toggleNavBar: () => void;
}
