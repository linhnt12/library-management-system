'use client';

import React from 'react';
import { FaCheck } from 'react-icons/fa6';
import Select, { MultiValue } from 'react-select';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface FormMultiSelectProps {
  value?: SelectOption[];
  onChange: (value: SelectOption[]) => void;
  options: SelectOption[];
  placeholder?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  isClearable?: boolean;
  isRtl?: boolean;
  isSearchable?: boolean;
  name?: string;
  className?: string;
  classNamePrefix?: string;
  variantType?: 'default' | 'filter';
  hideSelectedOptions?: boolean;
  closeMenuOnSelect?: boolean;
}

export const FormMultiSelect: React.FC<FormMultiSelectProps> = ({
  value = [],
  onChange,
  options,
  placeholder = 'Select options...',
  isDisabled = false,
  isLoading = false,
  isClearable = true,
  isRtl = false,
  isSearchable = true,
  name,
  className = 'basic-multi-select',
  classNamePrefix = 'select',
  variantType = 'default',
  hideSelectedOptions = false,
  closeMenuOnSelect = false,
}) => {
  const variantStyles = {
    default: {
      bg: '#f7f6f4', // layoutBg.500
      border: '1px solid',
      borderColor: '#e4e4e7', // gray.200
    },
    filter: {
      bg: '#f0efea', // paginationBg.500
      border: 'none',
      borderColor: 'transparent',
    },
  };

  const style = variantStyles[variantType];

  /*
		primary.200: #ff7b424d
		primary.500: #ff7b42
		layoutBg.500: #f7f6f4
		gray.200: #e4e4e7
		paginationBg.500: #f0efea
	*/

  return (
    <Select
      className={className}
      classNamePrefix={classNamePrefix}
      isMulti
      value={value}
      onChange={(newValue: MultiValue<SelectOption>) => onChange([...newValue])}
      isDisabled={isDisabled}
      isLoading={isLoading}
      isClearable={isClearable}
      isRtl={isRtl}
      isSearchable={isSearchable}
      name={name}
      options={options}
      placeholder={placeholder}
      hideSelectedOptions={hideSelectedOptions}
      closeMenuOnSelect={closeMenuOnSelect}
      formatOptionLabel={(option, { context }) => {
        if (context === 'menu') {
          // Check if the option is selected
          const isSelected = value.some(selected => selected.value === option.value);
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '20px', display: 'flex', justifyContent: 'center' }}>
                {isSelected && <FaCheck style={{ color: '#ff7b42', fontSize: '14px' }} />}
              </div>
              <span style={{ marginLeft: '6px' }}>{option.label}</span>
            </div>
          );
        }
        return option.label;
      }}
      styles={{
        control: baseStyles => ({
          ...baseStyles,
          minHeight: '50px',
          backgroundColor: style.bg,
          border: style.border,
          borderColor: `${style.borderColor} !important`,
          borderRadius: '8px',
          boxShadow: 'none',
          '&:hover': {
            borderColor: style.borderColor,
          },
        }),
        multiValue: baseStyles => ({
          ...baseStyles,
          backgroundColor: '#ff7b424d',
          color: '#191d26',
          borderRadius: '4px',
        }),
        multiValueLabel: baseStyles => ({
          ...baseStyles,
          color: '#191d26',
          fontSize: '14px',
        }),
        multiValueRemove: baseStyles => ({
          ...baseStyles,
          color: '#191d26',
          '&:hover': {
            backgroundColor: '#ff7b424d',
            color: '#191d26',
          },
        }),
        menu: baseStyles => ({
          ...baseStyles,
          boxShadow: 'none',
          border: `1px solid #e4e4e7`,
          marginTop: '0',
        }),
        option: (baseStyles, state) => ({
          ...baseStyles,
          backgroundColor: state.isSelected ? 'white' : state.isFocused ? '#ff7b424d' : 'white',
          color: '#191d26',
          '&:hover': {
            backgroundColor: '#ff7b424d',
          },
        }),
      }}
    />
  );
};
