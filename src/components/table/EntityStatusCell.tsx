'use client';

import { Tag } from '@/components';

interface EntityStatusCellProps<T> {
  item: T;
  onChangeStatus: (item: T) => void;
}

export function EntityStatusCell<T extends { isDeleted: boolean }>({
  item,
  onChangeStatus,
}: EntityStatusCellProps<T>) {
  const handleStatusClick = () => {
    onChangeStatus(item);
  };

  const isDeleted = item.isDeleted;

  return (
    <Tag
      variantType={isDeleted ? 'inactive' : 'active'}
      onClick={handleStatusClick}
      cursor="pointer"
      _hover={{ opacity: 0.8 }}
    >
      {isDeleted ? 'Inactive' : 'Active'}
    </Tag>
  );
}
