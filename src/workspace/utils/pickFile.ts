import pickFileAction, { pickFileError } from '~/infra/actions/pickFile';
import { uploadAction } from '~/workspace/actions/upload';

export const pickFile = ({ dispatch, parentId }: any) => {
  pickFileAction()
    .then(contentUri => {
      dispatch(uploadAction(parentId, contentUri));
    })
    .catch(err => {
      if (err.message === 'Error picking image' || err.message === 'Error picking document') {
        dispatch(pickFileError('workspace'));
      }
    });
};
