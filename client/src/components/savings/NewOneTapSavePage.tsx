import { Typography } from 'antd';
import React from 'react';

import QuickSaveForm from '../saves/QuickSaveForm';

const { Title } = Typography;

export default async function OneTapPage() {
  return (
    <>
      <Title level={2}>Add One-Tap Save</Title>
      <QuickSaveForm
        itemNameTitle='Action'
        itemNamePlaceholder='ex: Made lunch at home'
        isSavings={true}
      />
    </>
  );
}
