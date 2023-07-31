import { faAdd, faArrowRight, faSubtract } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Input.module.css";
import Link from "next/link";

export const Label = ({ required, error, label }) => {
  return (
    <div className={styles.labelContainer}>
      <label>
        {label} {required && <span>*</span>}
      </label>
      {error && <span>{error}</span>}
    </div>
  );
};

export const Input = ({
  type,
  choices,
  required,
  onChange,
  value,
  error,
  label,
  onFocus,
  onBlur,
  onSubmit,
  onKeyUp,
  onEnter,
  disabled,
  outlineColor,
}) => {
  return (
    <div className={styles.inputContainer}
      style={{
        opacity: disabled ? "0.3" : "",
        cursor: disabled ? "not-allowed" : "",
      }}
    >
      {label && <Label required={required} error={error} label={label} />}

      <div
        style={{
          pointerEvents: disabled ? "none" : "",
        }}
      >
        {type === "select" && choices ? (
          <select
            required={required}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            value={value || ""}
            style={{
              outlineColor: outlineColor || "",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onSubmit) onSubmit(e);
              if (e.key === "Enter" && onEnter) onEnter(e);
            }}
          >
            {choices.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type || "text"}
            required={required}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyUp={onKeyUp}
            value={value || ""}
            style={{
              paddingRight: onSubmit ? "44px" : "",
              outlineColor: outlineColor || "",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onSubmit) onSubmit(e);
              if (e.key === "Enter" && onEnter) onEnter(e);
            }}
          />
        )}

        {onSubmit && (
          <button className={styles.submitButton} onClick={(e) => onSubmit(e)}>
            <FontAwesomeIcon icon={faAdd} />
          </button>
        )}
      </div>
    </div>
  );
};

export const TextArea = ({
  required,
  onChange,
  value,
  error,
  label,
  onFocus,
  onBlur,
}) => {
  return (
    <div className={styles.inputContainer}>
      {label && <Label required={required} error={error} label={label} />}

      <textarea
        className="thinScroller"
        required={required}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        value={value || ""}
      />
    </div>
  );
};

export const ListItem = ({ item, action, actionType, link }) => {
  const content = (
    <div className={styles.itemContent}>
      <span>
        {item}
      </span>

      {action && (
        <button className={styles.action} onClick={(e) => {
          e.preventDefault();
          action();
        }}>
          <FontAwesomeIcon icon={actionType === "add" ? faAdd : faSubtract} />
        </button>
      )}

      {link && !action && (
        <button className={styles.action} onClick={action}>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      )}
    </div>
  );

  if (link) return (
    <li>
      <Link href={link} target="_blank" className={styles.listItem}>
        {content}
      </Link>
    </li>
  );

  return (
    <li className={styles.listItem}>
      {content}
    </li>
  );
};
