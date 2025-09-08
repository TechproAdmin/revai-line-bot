import { format, isValid, parse } from "date-fns";
import { ja } from "date-fns/locale";
import { useEffect, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import type { FormFieldConfig } from "@/shared/constants";
import "react-datepicker/dist/react-datepicker.css";

// 日本語ロケールを登録
registerLocale("ja", ja);

interface DateInputProps {
  field: FormFieldConfig;
  value: string | number | undefined;
  onChange: (name: string, value: string) => void;
  onFieldFocus: (fieldName: string) => void;
  onFieldBlur: () => void;
  onFieldChange: (fieldName: string) => void;
}

export function DateInput({
  field,
  value,
  onChange,
  onFieldFocus,
  onFieldBlur,
  onFieldChange,
}: DateInputProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (value && typeof value === "string") {
      // YYYY-MM-DD形式をDateオブジェクトに変換
      const parsedDate = parse(value, "yyyy-MM-dd", new Date());
      if (isValid(parsedDate)) {
        setSelectedDate(parsedDate);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);

    if (date) {
      // DateオブジェクトをYYYY-MM-DD形式に変換
      const formattedDate = format(date, "yyyy-MM-dd");
      onChange(field.name, formattedDate);
    } else {
      onChange(field.name, "");
    }

    onFieldChange(field.name);
  };

  return (
    <div className="flex flex-col">
      <label htmlFor={field.name} className="mb-1 font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        onFocus={() => onFieldFocus(field.name)}
        onBlur={onFieldBlur}
        dateFormat="yyyy/MM/dd"
        placeholderText="年/月/日"
        locale="ja"
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        yearDropdownItemNumber={100}
        scrollableYearDropdown
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        wrapperClassName="w-full"
        calendarClassName="shadow-lg"
      />
      {field.description && (
        <div className="text-xs text-gray-600 mt-1">{field.description}</div>
      )}
    </div>
  );
}
