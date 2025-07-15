import type { FormFieldConfig } from "@/shared/constants";
import { formatNumberDisplay, parseNumericInput } from "../utils/formUtils";

interface NumberInputProps {
  field: FormFieldConfig;
  value: number | undefined;
  onChange: (name: string, value: number | undefined) => void;
}

export function NumberInput({ field, value, onChange }: NumberInputProps) {
  return (
    <div className="flex flex-col">
      <label htmlFor={field.name} className="mb-1 font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          id={field.name}
          name={field.name}
          value={formatNumberDisplay(value)}
          onChange={(e) => {
            const numericValue = parseNumericInput(e.target.value);
            onChange(field.name, numericValue);
          }}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={field.required}
          placeholder="0"
        />
      </div>
      {field.formula && (
        <div className="text-xs text-gray-500 mt-1">
          初期値: {field.formula}
        </div>
      )}
      {field.description && (
        <div className="text-xs text-gray-600 mt-1">{field.description}</div>
      )}
    </div>
  );
}
