import { Button } from 'antd';

import { apiFetch } from '../../utils/general';

export default function UnreadButton() {
  return (
    <>
      <Button
        data-id='mark-all-unread'
        onClick={async () => {
          await apiFetch('/api/plaid/markAllUnread', 'GET');
          window.location.reload();
        }}
      >
        Mark all unread
      </Button>
    </>
  );
}
