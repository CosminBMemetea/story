"use client";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import ExifReader, { Tags } from "exifreader";
import {
  findCountry,
  loadCountries,
  VisitedCountry,
} from "../../lib/countries";

import styles from "./styles.module.css";

export interface PhotoResult {
  id: string;
  fileName: string;
  status: "processing" | "done" | "error";
  country?: VisitedCountry;
  errorMessage?: string;
}

interface FileUploadProps {
  photos: PhotoResult[];
  onPhotosChange: React.Dispatch<React.SetStateAction<PhotoResult[]>>;
}

const readGpsCoordinates = (
  tags: Tags
): { lat: number; lng: number } | null => {
  const lat = parseFloat(tags["GPSLatitude"]?.description ?? "");
  const lng = parseFloat(tags["GPSLongitude"]?.description ?? "");
  const latRef = tags["GPSLatitudeRef"]?.description;
  const lngRef = tags["GPSLongitudeRef"]?.description;
  if (Number.isNaN(lat) || Number.isNaN(lng) || !latRef || !lngRef) return null;
  return {
    lat: latRef.startsWith("South") ? -lat : lat,
    lng: lngRef.startsWith("West") ? -lng : lng,
  };
};

/** Reads a photo's GPS metadata and resolves its country, fully in the browser. */
const detectCountry = async (file: File): Promise<VisitedCountry> => {
  let tags: Tags;
  try {
    tags = ExifReader.load(await file.arrayBuffer());
  } catch {
    throw new Error("Unsupported image format");
  }
  const coordinates = readGpsCoordinates(tags);
  if (!coordinates) throw new Error("No GPS location in this photo");

  const country = findCountry(
    await loadCountries(),
    coordinates.lng,
    coordinates.lat
  );
  if (!country) throw new Error("Location is outside any country");
  return country;
};

export const FileUpload: React.FC<FileUploadProps> = ({
  photos,
  onPhotosChange,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const update = (id: string, patch: Partial<PhotoResult>) =>
    onPhotosChange((curr) =>
      curr.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );

  const onDrop = (acceptedFiles: File[]) => {
    setIsDragActive(false);
    const added = acceptedFiles.map((file) => ({
      file,
      id: crypto.randomUUID(),
    }));
    onPhotosChange((curr) => [
      ...curr,
      ...added.map(({ file, id }) => ({
        id,
        fileName: file.name,
        status: "processing" as const,
      })),
    ]);
    added.forEach(({ file, id }) => {
      detectCountry(file)
        .then((country) => update(id, { status: "done", country }))
        .catch((error: Error) =>
          update(id, { status: "error", errorMessage: error.message })
        );
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: { "image/*": [".heic", ".heif"] },
  });

  return (
    <div className={styles.fileUploadContainer}>
      <div
        {...getRootProps()}
        className={styles.dropzone}
        style={isDragActive ? { opacity: 0.7 } : undefined}
      >
        <input {...getInputProps()} />
        <p className={styles.dropzoneText}>
          Drop your travel photos here, or click to select them
        </p>
        <p className={styles.dropzoneHint}>
          Photos are read on your device and never uploaded.
        </p>
      </div>
      <div className={styles.filesList}>
        {photos.map((photo) => (
          <div key={photo.id} className={styles.fileItem}>
            <div className={styles.fileInfo}>
              <p>{photo.fileName}</p>
              {photo.country && <p>{photo.country.name}</p>}
              {photo.errorMessage && (
                <p className={styles.errorText}>{photo.errorMessage}</p>
              )}
            </div>
            <div className={styles.fileProgress}>
              <div className={styles.progressBarContainer}>
                <div
                  className={styles.progressBar}
                  style={{
                    width: photo.status === "processing" ? "30%" : "100%",
                  }}
                ></div>
              </div>
              <button
                className={styles.cancelButton}
                aria-label={`Remove ${photo.fileName}`}
                onClick={() =>
                  onPhotosChange((curr) =>
                    curr.filter((p) => p.id !== photo.id)
                  )
                }
              >
                <span className="material-icons-outlined">✕</span>
              </button>
            </div>
          </div>
        ))}
        {photos.length > 0 && (
          <button
            className={styles.deleteAllButton}
            onClick={() => onPhotosChange([])}
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
};
