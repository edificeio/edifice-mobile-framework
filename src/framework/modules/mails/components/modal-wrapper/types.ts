export interface ModalWrapperProps extends React.PropsWithChildren {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
  closeOnOverlayPress?: boolean;
  animationType?: 'slide' | 'fade' | 'none';
  presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';
}
