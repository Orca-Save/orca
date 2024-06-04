import { getAllLinkedItems } from '@/app/_actions/plaid';
import { Title } from '@/app/_components/Typography';
import InstitutionCollapses from './InstitutionsCollapse';

export default async function ListItems({ userId }: { userId: string }) {
  const itemsData = await getAllLinkedItems(userId);
  return (
    <div>
      <Title level={5}>Currently connected accounts</Title>
      <InstitutionCollapses itemsData={itemsData} />
    </div>
  );
}
