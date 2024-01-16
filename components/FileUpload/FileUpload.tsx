'use client'
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import styles from "./styles.module.css";

interface FileWithProgress {
  file: File;
  progress: number;
  uploaded: boolean;
  error: boolean;
  cancelTokenSource?: CancelTokenSource;
}

export const FileUpload: React.FC = () => {
    const [files, setFiles] = useState<FileWithProgress[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.filter(af => 
            !files.some(f => 
                f.file.name === af.name && 
                f.file.size === af.size && 
                f.file.lastModified === af.lastModified
            )
        ).map(file => ({
            file,
            progress: 0,
            uploaded: false,
            error: false
        }));

        if (newFiles.length > 0) {
            setFiles(curr => [...curr, ...newFiles]);
            newFiles.forEach(uploadFile);
        }
    }, [files]);


    const uploadFile = (fileWithProgress: FileWithProgress) => {
        const formData = new FormData();
        formData.append('photo', fileWithProgress.file);

        const cancelTokenSource = axios.CancelToken.source();
        fileWithProgress.cancelTokenSource = cancelTokenSource;

        const config: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                const total = progressEvent.total || 1; // Fallback to 1 if undefined
                const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
                setFiles((currFiles) =>
                    currFiles.map(fp =>
                        fp.file.name === fileWithProgress.file.name
                            ? { ...fp, progress: percentCompleted }
                            : fp
                    )
                );
            },
            cancelToken: cancelTokenSource.token
        };

        axios.post('http://localhost:8000/upload', formData, config)
            .then(response => {
                console.log(response.data); // Handle the response as needed
                setFiles((currFiles) =>
                    currFiles.map(fp =>
                        fp.file.name === fileWithProgress.file.name
                            ? { ...fp, uploaded: true, progress: 100 }
                            : fp
                    )
                );
            })
            .catch(error => {
                if (!axios.isCancel(error)) {
                    console.error('Error uploading file:', error);
                    setFiles((currFiles) =>
                        currFiles.map(fp =>
                            fp.file.name === fileWithProgress.file.name
                                ? { ...fp, error: true }
                                : fp
                        )
                    );
                }
            });
    };

    const cancelUpload = (fileName: string) => {
        const fileToCancel = files.find(f => f.file.name === fileName);
        fileToCancel?.cancelTokenSource?.cancel();

        setFiles(currFiles =>
            currFiles.filter(fp => fp.file.name !== fileName) // Remove the file from the list
        );
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return (
       <div className={styles.fileUploadContainer}>
            <div {...getRootProps()} className={styles.dropzone}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
            </div>
            <div className={styles.filesList}>
                {files.map((file, index) => (
                    <div key={index} className={styles.fileItem}>
                        <div className={styles.fileInfo}>
                            <span className="material-icons-outlined">description</span>
                            <p>{file.file.name}</p>
                        </div>
                        <div className={styles.fileProgress}>
                            <div className={styles.progressBarContainer}>
                                <div
                                    className={styles.progressBar}
                                    style={{ width: `${file.progress}%` }}
                                ></div>
                            </div>
                            <p>{file.progress.toFixed(0)}%</p>
                            {!file.uploaded && (
                                <button 
                                    className={styles.cancelButton} 
                                    onClick={() => cancelUpload(file.file.name)}
                                >
                                    <span className="material-icons-outlined">close</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
