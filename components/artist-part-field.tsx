import { artistParts, type ArtistPart } from "@/lib/artist-parts";

export default function ArtistPartField({ selected = [] }: { selected?: readonly ArtistPart[] | null }) {
  return (
    <fieldset className="artist-part-field">
      <legend>활동 역할 <span className="required-mark">*</span></legend>
      <p className="field-hint">실제로 맡는 역할을 하나 이상 선택하세요. 여러 개를 선택할 수 있습니다.</p>
      <div className="artist-part-options">
        {artistParts.map(({ value, label }) => (
          <label key={value}>
            <input
              type="checkbox"
              name="artistPart"
              value={value}
              defaultChecked={selected?.includes(value) ?? false}
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
