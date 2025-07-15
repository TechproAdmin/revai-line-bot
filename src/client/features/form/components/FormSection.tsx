import type { FormSection } from "@/shared/constants";
import type { FormDataType } from "@/shared/types";
import { LARGE_NUMBER_FIELDS } from "@/shared/constants";
import { FormField } from "./FormField";

interface FormSectionProps {
  section: FormSection;
  formData: FormDataType;
  onChange: (name: string, value: string | number | undefined) => void;
  onNumberChange: (name: string, value: number | undefined) => void;
}

export function FormSectionComponent({
  section,
  formData,
  onChange,
  onNumberChange,
}: FormSectionProps) {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {section.title}
        </h3>
        {section.caption && (
          <p className="text-sm text-gray-600">{section.caption}</p>
        )}
      </div>
      
      <div className="space-y-4">
        {section.fields.map((field) => (
          <FormField
            key={field.name}
            field={field}
            value={formData[field.name as keyof FormDataType]}
            onChange={onChange}
            onNumberChange={onNumberChange}
            isLargeNumber={LARGE_NUMBER_FIELDS.includes(field.name)}
          />
        ))}
      </div>
    </div>
  );
}