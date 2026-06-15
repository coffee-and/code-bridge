import { useEffect, useId, useState, type FormEvent } from "react";

import { useShapeStore } from "../../stores/shapeStore";
import type { ShapeType } from "../../types/shape";

interface ShapeCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHAPE_COLORS = [
  { name: "블루", value: "#0091ff" },
  { name: "스카이", value: "#55baff" },
  { name: "시안", value: "#35c5d0" },
  { name: "그린", value: "#42b883" },
  { name: "옐로", value: "#f0bd4e" },
  { name: "핑크", value: "#ee7eaa" },
  { name: "퍼플", value: "#6f78e8" },
  { name: "그레이", value: "#8799a7" },
];

const INITIAL_FORM = {
  name: "",
  type: "rectangle" as ShapeType,
  x: 80,
  y: 80,
  width: 100,
  height: 100,
  color: "#0091ff",
};

export const ShapeCreateModal = ({
  isOpen,
  onClose,
}: ShapeCreateModalProps) => {
  const titleId = useId();
  const addShape = useShapeStore((state) => state.addShape);

  const [form, setForm] = useState(INITIAL_FORM);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const updateNumberField = (
    field: "x" | "y" | "width" | "height",
    value: string,
  ) => {
    const numberValue = Number(value);

    setForm((current) => ({
      ...current,
      [field]: Number.isFinite(numberValue) ? numberValue : 0,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = form.name.trim();

    if (!trimmedName) {
      setErrorMessage("도형 이름을 입력해 주세요.");
      return;
    }

    if (form.width < 20 || form.height < 20) {
      setErrorMessage("도형의 너비와 높이는 20 이상이어야 합니다.");
      return;
    }

    addShape({
      ...form,
      name: trimmedName,
    });

    setForm(INITIAL_FORM);
    setErrorMessage("");
    onClose();
  };

  const handleClose = () => {
    setErrorMessage("");
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onMouseDown={handleClose}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <div>
            <h2 className="modal__title" id={titleId}>
              도형 만들기
            </h2>

            <p className="modal__description">
              프로그램에서 움직일 도형의 기본 속성을 정해 주세요.
            </p>
          </div>

          <button
            className="modal__close"
            type="button"
            aria-label="도형 만들기 창 닫기"
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        <form className="shape-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="form-field__label">도형 이름</span>

            <input
              className="form-control"
              type="text"
              value={form.name}
              placeholder="예: box, circle"
              autoFocus
              onChange={(event) => {
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }));
                setErrorMessage("");
              }}
            />
          </label>

          <fieldset className="form-field">
            <legend className="form-field__label">도형 종류</legend>

            <div className="shape-type-options">
              <button
                className={`shape-type-option ${
                  form.type === "rectangle" ? "shape-type-option--selected" : ""
                }`}
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    type: "rectangle",
                  }))
                }
              >
                <span className="shape-icon shape-icon--rectangle" />
                사각형
              </button>

              <button
                className={`shape-type-option ${
                  form.type === "circle" ? "shape-type-option--selected" : ""
                }`}
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    type: "circle",
                  }))
                }
              >
                <span className="shape-icon shape-icon--circle" />원
              </button>
              <button
                className={`shape-type-option ${
                  form.type === "triangle" ? "shape-type-option--selected" : ""
                }`}
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    type: "triangle",
                  }))
                }
              >
                <svg
                  className="shape-icon shape-icon--triangle"
                  viewBox="0 0 32 30"
                  aria-hidden="true"
                >
                  <path
                    d="M16 3L29 27H3L16 3Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>

                <span>삼각형</span>
              </button>
            </div>
          </fieldset>

          <fieldset className="form-field">
            <legend className="form-field__label">색상</legend>

            <div className="color-options">
              {SHAPE_COLORS.map((color) => (
                <button
                  key={color.value}
                  className={`color-option ${
                    form.color === color.value ? "color-option--selected" : ""
                  }`}
                  type="button"
                  aria-label={`${color.name} 색상 선택`}
                  title={color.name}
                  style={{
                    backgroundColor: color.value,
                  }}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      color: color.value,
                    }))
                  }
                />
              ))}
            </div>
          </fieldset>

          <div className="form-grid">
            <label className="form-field">
              <span className="form-field__label">X 위치</span>

              <input
                className="form-control"
                type="number"
                min="0"
                value={form.x}
                onChange={(event) => updateNumberField("x", event.target.value)}
              />
            </label>

            <label className="form-field">
              <span className="form-field__label">Y 위치</span>

              <input
                className="form-control"
                type="number"
                min="0"
                value={form.y}
                onChange={(event) => updateNumberField("y", event.target.value)}
              />
            </label>

            <label className="form-field">
              <span className="form-field__label">너비</span>

              <input
                className="form-control"
                type="number"
                min="20"
                max="300"
                value={form.width}
                onChange={(event) =>
                  updateNumberField("width", event.target.value)
                }
              />
            </label>

            <label className="form-field">
              <span className="form-field__label">높이</span>

              <input
                className="form-control"
                type="number"
                min="20"
                max="300"
                value={form.height}
                onChange={(event) =>
                  updateNumberField("height", event.target.value)
                }
              />
            </label>
          </div>

          {errorMessage && (
            <p className="form-error" role="alert">
              {errorMessage}
            </p>
          )}

          <div className="modal__actions">
            <button className="button" type="button" onClick={handleClose}>
              취소
            </button>

            <button className="button button--primary" type="submit">
              도형 만들기
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
