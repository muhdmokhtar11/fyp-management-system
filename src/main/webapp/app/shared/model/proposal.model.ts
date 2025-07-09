import dayjs from 'dayjs';
import { IUser } from 'app/shared/model/user.model';
import { ProposalStatus } from 'app/shared/model/enumerations/proposal-status.model';

export interface IProposal {
  id?: number;
  title?: string;
  proposalAbstract?: string;
  submissionDate?: dayjs.Dayjs;
  methodology?: string;
  status?: keyof typeof ProposalStatus;
  plagiarismScore?: number | null;
  student?: IUser;
  preferredSupervisor?: IUser | null;
}

export const defaultValue: Readonly<IProposal> = {};
