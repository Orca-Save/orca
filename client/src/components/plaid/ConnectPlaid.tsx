import { Skeleton } from 'antd';
import useFetch from '../../hooks/useFetch';
import ConnectPlaidCard from './ConnectPlaidCard';

export default function ConnectPlaid() {
  const { data } = useFetch('api/plaid/linkToken', 'GET');
  if (!data) return <Skeleton active />;
  const { linkToken } = data;
  return <ConnectPlaidCard linkToken={linkToken} />;
}
