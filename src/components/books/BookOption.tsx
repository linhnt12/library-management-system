import type { BookOption } from '@/lib/hooks/useBooks';
import Image from 'next/image';

interface BookOptionProps {
  option: BookOption;
}

export function BookOption({ option }: BookOptionProps) {
  const { title, coverImageUrl, authorName, publishYear } = option;

  return (
    <div className="flex items-center gap-3 p-2">
      {/* Cover Image */}
      <div className="flex-shrink-0">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            width={40}
            height={60}
            className="rounded object-cover"
          />
        ) : (
          <div className="w-10 h-15 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-xs text-gray-500">No Image</span>
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{title}</div>
        <div className="text-xs text-gray-600 truncate">{authorName}</div>
        {publishYear && <div className="text-xs text-gray-500">{publishYear}</div>}
      </div>
    </div>
  );
}

interface BookOptionDisplayProps {
  value: string;
  options: BookOption[];
}

export function BookOptionDisplay({ value, options }: BookOptionDisplayProps) {
  const selectedOption = options.find(option => option.value === value);

  if (!selectedOption) return null;

  return <BookOption option={selectedOption} />;
}
