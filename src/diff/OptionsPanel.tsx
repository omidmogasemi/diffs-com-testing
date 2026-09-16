import {
  CONTROL_GROUPS,
  CONTROLS,
  type Control,
  type GalleryOptions,
} from "./options";

export type OptionValue = string | number | boolean;

interface OptionsPanelProps {
  options: GalleryOptions;
  onChange: (key: keyof GalleryOptions, value: OptionValue) => void;
  onReset: () => void;
  /**
   * False for the single-file viewer, which ignores every diff-only option.
   * Those controls stay visible but disabled, so the panel still documents the
   * full surface instead of silently shrinking.
   */
  supportsDiffOptions: boolean;
  isDirty: boolean;
}

export default function OptionsPanel({
  options,
  onChange,
  onReset,
  supportsDiffOptions,
  isDirty,
}: OptionsPanelProps) {
  return (
    <aside className="options" aria-label="Rendering options">
      <div className="options__head">
        <h2 className="options__title">Options</h2>
        <button
          type="button"
          className="options__reset"
          onClick={onReset}
          disabled={!isDirty}
        >
          Reset to defaults
        </button>
      </div>

      {CONTROL_GROUPS.map((group) => {
        const controls = CONTROLS.filter((c) => c.group === group);
        if (controls.length === 0) return null;

        return (
          <fieldset className="options__group" key={group}>
            <legend className="options__legend">{group}</legend>
            {controls.map((control) => (
              <ControlRow
                key={control.key}
                control={control}
                options={options}
                onChange={onChange}
                disabled={control.scope === "diff" && !supportsDiffOptions}
              />
            ))}
          </fieldset>
        );
      })}
    </aside>
  );
}

interface ControlRowProps {
  control: Control;
  options: GalleryOptions;
  onChange: (key: keyof GalleryOptions, value: OptionValue) => void;
  disabled: boolean;
}

function ControlRow({ control, options, onChange, disabled }: ControlRowProps) {
  const id = `option-${control.key}`;
  const helpId = `${id}-help`;

  return (
    <div
      className={`control${disabled ? " control--disabled" : ""}`}
      data-kind={control.kind}
    >
      {control.kind === "toggle" ? (
        <label className="control__label" htmlFor={id}>
          <input
            id={id}
            type="checkbox"
            checked={options[control.key]}
            disabled={disabled}
            aria-describedby={helpId}
            onChange={(e) => onChange(control.key, e.target.checked)}
          />
          <span className="control__name">{control.label}</span>
        </label>
      ) : (
        <>
          <label className="control__name" htmlFor={id}>
            {control.label}
          </label>
          {control.kind === "select" ? (
            <select
              id={id}
              className="control__input"
              value={options[control.key]}
              disabled={disabled}
              aria-describedby={helpId}
              onChange={(e) => onChange(control.key, e.target.value)}
            >
              {control.choices.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={id}
              className="control__input"
              type="number"
              min={control.min}
              max={control.max}
              step={control.step}
              value={options[control.key]}
              disabled={disabled}
              aria-describedby={helpId}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isFinite(next)) onChange(control.key, next);
              }}
            />
          )}
        </>
      )}
      <p className="control__help" id={helpId}>
        {control.help}
        {disabled ? " Not used by the single-file viewer." : ""}
      </p>
    </div>
  );
}
