import { useEffect, useState, useRef } from "react";
import { Upload, FileText, Download, Trash2, ImagePlus } from "lucide-react";
import {
  storeAttachment,
  attachmentBlob,
  deleteAttachment,
  ACCEPTED_FILES,
} from "../services/attachmentService";
import type { Attachment } from "../types/models";
import { Modal } from "./ui/Modal";
export function useAttachmentUrl(file?: Attachment) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    setUrl("");
    setError("");
    if (!file) return;
    let active = true;
    let created = "";
    attachmentBlob(file)
      .then((blob) => {
        if (active) {
          created = URL.createObjectURL(blob);
          setUrl(created);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
      if (created) URL.revokeObjectURL(created);
    };
  }, [file?.id]);
  return { url, error };
}
function FilePreview({
  file,
  onRemove,
}: {
  file: Attachment;
  onRemove?: () => void;
}) {
  const { url, error } = useAttachmentUrl(file);
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <div className="file-preview">
        <button
          type="button"
          className="file-open"
          onClick={() => setExpanded(true)}
          disabled={!url}
        >
          {file.type.startsWith("image/") && url ? (
            <img src={url} alt={file.name} />
          ) : (
            <FileText size={28} />
          )}
          <span>
            <strong>{file.name}</strong>
            <small>
              {(file.size / 1024).toFixed(0)} KB - saved on this device
            </small>
          </span>
        </button>
        {url && (
          <a
            className="icon-button"
            href={url}
            download={file.name}
            aria-label={"Download " + file.name}
          >
            <Download size={18} />
          </a>
        )}
        {onRemove && (
          <button
            type="button"
            className="icon-button"
            aria-label={"Remove " + file.name}
            onClick={onRemove}
          >
            <Trash2 size={17} />
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {expanded && (
        <Modal title={file.name} onClose={() => setExpanded(false)}>
          {file.type === "application/pdf" ? (
            <iframe className="pdf-preview" src={url} title={file.name} />
          ) : (
            <img className="full-file-image" src={url} alt={file.name} />
          )}
          <a className="button secondary" href={url} download={file.name}>
            Download original
          </a>
        </Modal>
      )}
    </>
  );
}
export function AttachmentGallery({ files = [] }: { files?: Attachment[] }) {
  return (
    <div className="attachment-gallery">
      {files.map((file) => (
        <FilePreview key={file.id} file={file} />
      ))}
    </div>
  );
}
export function AttachmentPicker({
  files,
  onChange,
  onBusy,
}: {
  files: Attachment[];
  onChange: (files: Attachment[]) => void;
  onBusy?: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  return (
    <section className="attachment-picker">
      <h3>Photos & documents</h3>
      <p>
        Attach document scans, bill photos, or PDFs. Files stay in this browser
        on this device.
      </p>
      <label className={"upload-zone " + (busy ? "is-busy" : "")}>
        <ImagePlus size={26} />
        <strong>{busy ? "Adding files..." : "Add photos or PDFs"}</strong>
        <span>JPG, PNG, WebP, PDF | up to 10 MB each | 10 files</span>
        <input
          aria-label="Add photos or PDFs"
          type="file"
          accept={ACCEPTED_FILES}
          multiple
          disabled={busy || files.length >= 10}
          onChange={async (e) => {
            const selected = Array.from(e.target.files || []);
            e.target.value = "";
            if (!selected.length) return;
            setBusy(true);
            onBusy?.(true);
            setError("");
            const added: Attachment[] = [];
            try {
              if (files.length + selected.length > 10)
                throw new Error("You can attach up to 10 files per record.");
              for (const file of selected)
                added.push(await storeAttachment(file));
              if (alive.current) onChange([...files, ...added]);
              else await Promise.all(added.map((f) => deleteAttachment(f.id)));
            } catch (e) {
              await Promise.all(
                added.map((f) => deleteAttachment(f.id).catch(() => {})),
              );
              if (alive.current) setError((e as Error).message);
            } finally {
              if (alive.current) {
                setBusy(false);
                onBusy?.(false);
              }
            }
          }}
        />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {files.map((file) => (
        <FilePreview
          key={file.id}
          file={file}
          onRemove={() => onChange(files.filter((f) => f.id !== file.id))}
        />
      ))}
    </section>
  );
}
