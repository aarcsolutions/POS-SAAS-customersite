'use client';

import { StoreSelect } from '@/components/ui/StoreSelect';
import { CITY_SELECT_OPTIONS } from '@/constants/cities';

interface CitySelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  'aria-label'?: string;
}

export function CitySelect({
  value,
  onChange,
  disabled,
  className,
  placeholder = 'Select city',
  'aria-label': ariaLabel = 'City',
}: CitySelectProps) {
  const options =
    value && !CITY_SELECT_OPTIONS.some((o) => o.value === value)
      ? [{ value, label: value }, ...CITY_SELECT_OPTIONS]
      : CITY_SELECT_OPTIONS;

  return (
    <StoreSelect
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      searchable
      searchPlaceholder="Search city…"
      aria-label={ariaLabel}
    />
  );
}
