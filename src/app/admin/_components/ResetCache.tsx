'use client';

import { Button } from 'antd';
import { resetCache } from '../_actions/reset';

export default function ResetCache() {
  const resetCacheEvent = resetCache.bind(null);
  const onClick = () => resetCacheEvent();
  return (
    <Button data-id='reset-cache-button' onClick={onClick}>
      Reset Cache
    </Button>
  );
}
