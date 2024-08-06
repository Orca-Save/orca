import { Button } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { apiFetch } from '../../utils/general';

export default function UpdateSubscriptionForm({
  cancel,
  actionText,
}: {
  actionText: string;
  cancel: boolean;
}) {
  const navigate = useNavigate();

  return (
    <Button
      data-id='update-subscription-button'
      onClick={async () => {
        await apiFetch('/api/stripe/updateSubscription', 'POST', {
          cancel,
        });
        window.location.reload();
      }}
    >
      {actionText}
    </Button>
  );
}
