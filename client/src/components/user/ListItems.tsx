import React from 'react';

import useFetch from '../../hooks/useFetch';
import InstitutionCollapses from '../plaid/InstitutionsCollapse';

export default function ListItems() {
  const { data } = useFetch('api/plaid/listAllLinkedItems', 'GET');
  if (!data) return null;
  const { itemsData } = data;
  return (
    <div>
      <InstitutionCollapses itemsData={itemsData} />
    </div>
  );
}
