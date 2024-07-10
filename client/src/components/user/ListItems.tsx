import { getAllLinkedItems } from '@/app/_actions/plaid';
import InstitutionCollapses from '../../plaid/InstitutionsCollapse';

export default async function ListItems({ userId }: { userId: string }) {
  const itemsData = await getAllLinkedItems(userId);
  return (
    <div>
      <InstitutionCollapses itemsData={itemsData} userId={userId} />
    </div>
  );
}
