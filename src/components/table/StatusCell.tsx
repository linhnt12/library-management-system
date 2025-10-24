'use client';

import { Tag } from '@/components';

interface StatusCellProps<T> {
  item: T;
  onChangeStatus: (item: T) => void;
}

export function StatusCell<T extends { isDeleted: boolean }>({
  item,
  onChangeStatus,
}: StatusCellProps<T>) {
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
