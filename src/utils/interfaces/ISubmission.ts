export interface ISubmission {
  _id: string;
  name: string;
  user_id: {
    _id: string;
    name: string;
  };
}
