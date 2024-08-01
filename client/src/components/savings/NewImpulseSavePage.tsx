import { Typography } from 'antd';
import QuickSaveForm from '../saves/QuickSaveForm';

const { Title } = Typography;

export default async function ImpulseSavePage() {
  return (
    <>
      <Title level={2}>Add Impulse Save</Title>
      <QuickSaveForm
        itemNameTitle='Item Name'
        itemNamePlaceholder='ex: Starbucks Iced Latte'
        isSavings={true}
      />
    </>
  );
}
