'use client';
import React, { useCallback, useState, useContext } from 'react';

import { useDropzone } from 'react-dropzone';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import AnonymousUserIdContext from '../../app/context/AnonymousUserIdContext';

import styles from "./styles.module.css";

interface FileWithProgress {
  file: File;
  progress: number;
  uploaded: boolean;
  error: boolean;
  country?: string; // New property for country
  cancelTokenSource?: CancelTokenSource;
}


export const FileUpload: React.FC = () => {
    const anonymousUserId = useContext(AnonymousUserIdContext); // Make sure that is the first line in a component

    const [files, setFiles] = useState<FileWithProgress[]>([]);
   
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const uploadFile = (fileWithProgress: FileWithProgress) => {
        console.log(anonymousUserId);
        if (anonymousUserId) {   
            const formData = new FormData();
            formData.append('photo', fileWithProgress.file);
            formData.append('anonymousUserId', anonymousUserId);
        
            const cancelTokenSource = axios.CancelToken.source();
            fileWithProgress.cancelTokenSource = cancelTokenSource;

            const config: AxiosRequestConfig = {
                headers: {
                     'Content-Type': 'multipart/form-data', // Adjust the Content-Type header
                },
                onUploadProgress: (progressEvent: any) => {
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

            axios.post('https://nomad-nuxtjs.vercel.app/api/upload', formData, config)
                .then((response: { data: { locationDetails: any; }; }) => {
                    console.log(response.data); // Handle the response as needed
                    setFiles((currFiles) =>
                        currFiles.map(fp =>
                            fp.file.name === fileWithProgress.file.name
                                ? { ...fp, uploaded: true, progress: 100, country: response.data.locationDetails }
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

        }else{
            console.log(anonymousUserId);
            // TODO this should not be the case but handling is necessary
        }
        };
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


  

    const cancelUpload = (fileName: string) => {
        const fileToCancel = files.find(f => f.file.name === fileName);
        fileToCancel?.cancelTokenSource?.cancel();

        setFiles(currFiles =>
            currFiles.filter(fp => fp.file.name !== fileName) // Remove the file from the list
        );
    };

    const deleteAllFiles = () => {
        if(anonymousUserId){
            axios.delete('https://nomad-nexus.vercel.app/delete', {
                data: { anonymousUserId },
            })
            .then(() => {
                // If deletion is successful, clear the files array in the state
                setFiles([]);
            })
            .catch((error: any) => {
                console.error('Error deleting files:', error);
                // Handle any errors that occur during deletion
            });
        }else{
            console.log(anonymousUserId);
            // TODO this should not be the case but handling is necessary
        }       
    };


    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return (
       <div className={styles.fileUploadContainer}>
            <div {...getRootProps()} className={styles.dropzone}>
                <input {...getInputProps()} />
                <p className={styles.dropzoneText}>Press here to load your photos!</p>
            </div>
            <div className={styles.filesList}>
                {files.map((file, index) => (
                    <div key={index} className={styles.fileItem}>
                        <div className={styles.fileInfo}>
                            <span className="material-icons-outlined"></span>
                            <p>{file.file.name}</p>
                            {file.country && <p>Country: {file.country}</p>} {/* Display country */}
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
                {files.length > 0 && (
                    <button className={styles.deleteAllButton} onClick={deleteAllFiles}>
                        Delete All
                    </button>
                )}
            </div>
        </div>
    );
};
