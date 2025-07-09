import { IProposal } from 'app/shared/model/proposal.model';

export interface IFile {
  id?: number;
  name?: string;
  contentContentType?: string;
  content?: string;
  proposal?: IProposal | null;
}

export const defaultValue: Readonly<IFile> = {};
