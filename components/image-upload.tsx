"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { safeUrl } from "@/lib/urls";
export default function ImageUpload({
  value,
  onChange,
  onBusyChange,
  disabled,
}: {
  value: string;
  onChange: (url: string) => void;
  onBusyChange: (busy: boolean) => void;
  disabled: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const lock = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  async function upload(files: FileList | null) {
    if (disabled || lock.current || !files?.length) return;
    setError("");
    setMessage("");
    if (files.length !== 1) {
      setError("이미지 한 장만 선택해 주세요.");
      return;
    }
    const file = files[0];
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("JPG 또는 PNG 이미지를 선택해 주세요.");
      return;
    }
    if (!file.size || file.size > 8 * 1024 * 1024) {
      setError("이미지는 8MB 이하로 선택해 주세요.");
      return;
    }
    lock.current = true;
    setBusy(true);
    onBusyChange(true);
    setPreview(URL.createObjectURL(file));
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/uploads/images", {
        method: "POST",
        body,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      onChange(result.data.url);
      setMessage("업로드 완료. 프로필 저장을 누르면 공개 이미지에 반영됩니다.");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "업로드하지 못했습니다.",
      );
    } finally {
      setPreview(null);
      lock.current = false;
      setBusy(false);
      onBusyChange(false);
      if (input.current) input.current.value = "";
    }
  }
  const source = preview || safeUrl(value);
  return (
    <div className="image-upload">
      <div
        className={`image-dropzone ${dragging ? "is-dragging" : ""}`}
        aria-busy={busy}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && !busy) setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node))
            setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void upload(event.dataTransfer.files);
        }}
      >
        {source ? (
          <Image
            src={source}
            alt="프로필 이미지 미리보기"
            width={360}
            height={400}
            unoptimized
            className="upload-preview"
          />
        ) : (
          <div className="upload-placeholder" aria-hidden="true">
            ↥
          </div>
        )}
        <div className="dropzone-copy">
          <p>
            {busy
              ? "이미지를 업로드하고 있습니다…"
              : "이미지를 여기로 드래그하세요"}
          </p>
          <span>JPG · PNG / 최대 8MB</span>
          <button
            type="button"
            className="button upload-select"
            disabled={disabled || busy}
            onClick={() => input.current?.click()}
          >
            {source ? "이미지 변경" : "파일 선택"}
          </button>
        </div>
        <input
          ref={input}
          className="visually-hidden"
          type="file"
          accept="image/jpeg,image/png"
          aria-label="프로필 이미지 파일 선택"
          disabled={disabled || busy}
          onChange={(event) => void upload(event.currentTarget.files)}
        />
      </div>
      {value && (
        <button
          type="button"
          className="text-link"
          disabled={disabled || busy}
          onClick={() => {
            onChange("");
            setError("");
            setMessage("프로필 저장 시 이미지가 제거됩니다.");
          }}
        >
          현재 이미지 제거
        </button>
      )}
      <p className="form-note">
        가로·세로 4,000px 이하, 총 800만 픽셀 이하의 이미지를 사용할 수
        있습니다.
      </p>
      {message && (
        <p role="status" className="upload-message">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
    </div>
  );
}
