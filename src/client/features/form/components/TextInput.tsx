import type { FormFieldConfig } from "@/shared/constants";

interface TextInputProps {
  field: FormFieldConfig;
  value: string | number | undefined;
  onChange: (name: string, value: string) => void;
  onNumberChange: (name: string, value: number | undefined) => void;
}

export function TextInput({
  field,
  value,
  onChange,
  onNumberChange,
}: TextInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (field.type === "number") {
      const numericValue =
        e.target.value === "" ? undefined : Number(e.target.value);
      onNumberChange(field.name, numericValue);
    } else {
      onChange(field.name, e.target.value);
    }
  };

  return (
    <div className="flex flex-col">
      <label htmlFor={field.name} className="mb-1 font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={field.type}
        id={field.name}
        name={field.name}
        value={value ?? ""}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required={field.required}
        step={field.step}
      />
      {field.formula && (
        <div className="text-xs text-gray-500 mt-1">
          初期値: {field.formula}
        </div>
      )}
      {field.description && (
        <div className="text-xs text-gray-600 mt-1">
          {field.description}
        </div>
      )}
    </div>
  );
}
