import { Skeleton } from 'antd';
import React from 'react';

import useFetch from '../../hooks/useFetch';
import InstitutionCollapses from '../plaid/InstitutionsCollapse';

export default function ListItems() {
  const { data } = useFetch('api/plaid/listAllLinkedItems', 'GET');
  if (!data) return <Skeleton active />;
  const { itemsData } = data;
  return <InstitutionCollapses itemsData={itemsData} />;
}
