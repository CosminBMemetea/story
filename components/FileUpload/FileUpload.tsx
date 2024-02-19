'use client';
import React, { useCallback, useState, useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import axios, {AxiosRequestConfig, CancelTokenSource } from 'axios';
import AnonymousUserIdContext from '../../app/context/AnonymousUserIdContext';

import styles from "./styles.module.css";

import ExifReader, { Tags } from 'exifreader';

interface FileWithProgress {
  file: File;
  progress: number;
  uploaded: boolean;
  error: boolean;
  country?: string; // New property for country
  cancelTokenSource?: CancelTokenSource;
}

interface Coordinates {
    latitude: number;
    longitude: number;
}

interface LocationDetails {
  address: {
    country?: string;
    country_code?: string;
  };
}

const getLocationDetails = async (coordinates: Coordinates): Promise<LocationDetails | null> => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.latitude}&lon=${coordinates.longitude}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching location details:', error);
    return null;
  }
};


const parseExifDataSimple = (tags: Tags): Coordinates | null => {
    const latitudeDescription = tags['GPSLatitude']?.description;
    const longitudeDescription = tags['GPSLongitude']?.description;

    if (!latitudeDescription || !longitudeDescription) {
        console.error("Lipsesc datele EXIF pentru coordonate.");
        return null;
    }

    const latitude = parseFloat(latitudeDescription);
    const longitude = parseFloat(longitudeDescription);

    if (!isNaN(latitude) && !isNaN(longitude)) {
        return { latitude, longitude };
    } else {
        console.error("Nu s-au putut converti coordonatele în numere.");
        return null;
    }
};


export const FileUpload: React.FC = () => {
    const anonymousUserId = useContext(AnonymousUserIdContext);
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
   const uploadFile = async (fileWithProgress: FileWithProgress) => {
    // Crearea unui CancelToken pentru a permite anularea cererii
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
    fileWithProgress.cancelTokenSource = cancelTokenSource;

    const reader = new FileReader();

    reader.onload = async (event: ProgressEvent<FileReader>) => {
        if (event.target?.result && typeof event.target.result === 'object') {
        const tags = ExifReader.load(event.target.result);
        const coordinates = parseExifDataSimple(tags);

        if (coordinates) {
            const locationDetails = await getLocationDetails(coordinates);

            if (locationDetails) {
            const payload = {
                anonymousUserId: anonymousUserId,
                file: fileWithProgress.file.name,
                address: JSON.stringify({
                address: {
                    country: locationDetails.address.country,
                    country_code: locationDetails.address.country_code,
                },
                lat: coordinates.latitude,
                lon: coordinates.longitude
                }),
            };

            const config: AxiosRequestConfig = {
                headers: {
                'Content-Type': 'application/json',
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

            try {
                const response = await axios.post('https://nomad-nexus-api.vercel.app/upload', payload, config);
                setFiles((currFiles) =>
                currFiles.map(fp =>
                    fp.file.name === fileWithProgress.file.name
                        ? { ...fp, uploaded: true, progress: 100 }
                        : fp
                )
                );
            } catch (error) {
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
            }
            }
        }
        }
    };

    reader.onerror = (error) => {
        console.error('Error reading file:', error);
    };

    // Start reading the file as an ArrayBuffer to process it with ExifReader
    reader.readAsArrayBuffer(fileWithProgress.file);
    };
    
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
