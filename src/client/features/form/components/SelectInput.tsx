import type { FormFieldConfig } from "@/shared/constants";

interface SelectInputProps {
  field: FormFieldConfig;
  value: string | undefined;
  onChange: (name: string, value: string) => void;
}

export function SelectInput({ field, value, onChange }: SelectInputProps) {
  return (
    <div className="flex flex-col">
      <label htmlFor={field.name} className="mb-1 font-medium">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={field.name}
        name={field.name}
        value={value ?? ""}
        onChange={(e) => onChange(field.name, e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required={field.required}
      >
        {field.options?.map((option) => (
          <option key={option} value={option}>
            {option || "選択してください"}
          </option>
        ))}
      </select>
      {field.description && (
        <div className="text-xs text-gray-600 mt-1">{field.description}</div>
      )}
    </div>
  );
}
