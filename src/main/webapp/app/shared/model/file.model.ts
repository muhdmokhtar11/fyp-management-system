import { IProposal } from 'app/shared/model/proposal.model';

export interface IFile {
  id?: number;
  name?: string;
  contentContentType?: string;
  content?: string;
  status?: FileStatus;
  proposal?: IProposal | null;
}

export enum FileStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export const defaultValue: Readonly<IFile> = {};
