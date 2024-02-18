'use client';
import React, { useCallback, useState, useContext } from 'react';
import heic2any from "heic2any";

import { useDropzone } from 'react-dropzone';
import axios, { CancelTokenSource } from 'axios';
import AnonymousUserIdContext from '../../app/context/AnonymousUserIdContext';

import styles from "./styles.module.css";

import EXIF from 'exif-js';

interface FileWithProgress {
  file: File;
  progress: number;
  uploaded: boolean;
  error: boolean;
  country?: string; // New property for country
  cancelTokenSource?: CancelTokenSource;
}

interface ExifData {
    GPSLatitude?: number[];
    GPSLatitudeRef?: string;
    GPSLongitude?: number[];
    GPSLongitudeRef?: string;
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

const getLocationDetails = async (latitude: number, longitude: number): Promise<LocationDetails | null> => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { lat: latitude, lon: longitude, format: 'json' },
    });
    return response.data as LocationDetails;
  } catch (error) {
    console.error('Error fetching location data:', error);
    return null;
  }
};

const parseExifData = (exifData: ExifData): Coordinates | null => {
    let latitude: number | null = null;
    let longitude: number | null = null;

    if (exifData.GPSLatitude && exifData.GPSLatitudeRef) {
        const latRef = `${exifData.GPSLatitude[0]} deg ${exifData.GPSLatitude[1]}' ${exifData.GPSLatitude[2]}" ${exifData.GPSLatitudeRef}`;
        latitude = dmsToDecimal(latRef);
    }

    if (exifData.GPSLongitude && exifData.GPSLongitudeRef) {
        const lonRef = `${exifData.GPSLongitude[0]} deg ${exifData.GPSLongitude[1]}' ${exifData.GPSLongitude[2]}" ${exifData.GPSLongitudeRef}`;
        longitude = dmsToDecimal(lonRef);
    }

    if (latitude !== null && longitude !== null) {
        return { latitude, longitude };
    }

    return null;
};

const dmsToDecimal = (dms: string): number | null => { 
    const parts = dms.match(/(\d+) deg (\d+)' ([\d.]+)\"? ([NSEW])/);
    if (!parts) return null;

    const degrees = parseFloat(parts[1]);
    const minutes = parseFloat(parts[2]);
    const seconds = parseFloat(parts[3]);
    const direction = parts[4];

    let decimal = degrees + minutes / 60 + seconds / 3600;
    if (direction === 'S' || direction === 'W') {
        decimal = decimal * -1; // Negate for south and west
    }
    return decimal;   
 };


export const FileUpload: React.FC = () => {
   const anonymousUserId = useContext(AnonymousUserIdContext);
   const [files, setFiles] = useState<FileWithProgress[]>([]);

   const onDrop = useCallback((acceptedFiles: File[]) => {
   
    const uploadFile = async (fileWithProgress: FileWithProgress) => {
    if (!anonymousUserId) {
        console.log('No anonymousUserId found');
        return; // Oprire dacă nu există anonymousUserId
    }

      // Verifică dacă fișierul este HEIC și convertește-l în JPEG
    if (fileWithProgress.file.type === 'image/heic') {
        console.log('Converting HEIC file to JPEG...');
        try {
            const conversionResult = await heic2any({
                blob: fileWithProgress.file,
                toType: "image/jpeg",
                quality: 0.8 // Ajustează calitatea după necesități
            });


            if (Array.isArray(conversionResult) && conversionResult.length > 0) {
                // Concatenează toate Blob-urile într-unul singur dacă conversionResult este un array
                const concatenatedBlob = new Blob(conversionResult, { type: 'image/jpeg' });
                fileWithProgress.file = new File([concatenatedBlob], fileWithProgress.file.name.replace('.heic', '.jpeg'), { type: 'image/jpeg' });
            } else if (conversionResult instanceof Blob) {
                // Utilizează conversionResult direct dacă este un Blob
                fileWithProgress.file = new File([conversionResult], fileWithProgress.file.name.replace('.heic', '.jpeg'), { type: 'image/jpeg' });
            }
           } catch (error) {
            console.error('Error converting HEIC to JPEG:', error);
            return; // Oprire în caz de eroare la conversie
        }
    }
    // Utilizarea FileReader pentru a citi conținutul fișierului
    const reader = new FileReader();

    reader.onload = async (event) => {
        if (event.target?.result && event.target.result instanceof ArrayBuffer) {
            // Prezumând că EXIF poate lucra direct cu ArrayBuffer și extrage datele EXIF
            console.log(event.target.result);
            const exifData = EXIF.readFromBinaryFile(event.target.result);
            console.log(exifData); // Loghează datele EXIF pentru verificare

            const coordinates = parseExifData(exifData); // Funcția parseExifData trebuie definită pentru a extrage coordonatele

            let address : string | null= null;
            if (coordinates && coordinates.latitude && coordinates.longitude) {
                const locationDetails = await getLocationDetails(coordinates.latitude, coordinates.longitude); // Funcția getLocationDetails trebuie definită

                if (locationDetails) {
                    address = JSON.stringify(locationDetails);
                    console.log('Address',address);

                } else {
                    console.log('Location details could not be retrieved');
                }
            
                setFiles((currFiles) =>
                    currFiles.map((fp) =>
                        fp.file.name === fileWithProgress.file.name ? { ...fp, country: locationDetails?.address?.country } : fp
                    )
                );

                const payload = {
                    anonymousUserId: anonymousUserId,
                    address: address,
                    file:  fileWithProgress.file.name,
                };

                fetch('https://nomad-nexus-api.vercel.app/upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data); // Prelucrarea răspunsului
                })
                .catch(error => {
                    console.error('Error uploading file:', error);
                });
            }
        }
    };

    reader.onerror = (error) => {
        console.error('Error reading file:', error);
    };

    // Inițiază citirea fișierului ca ArrayBuffer
    reader.readAsArrayBuffer(fileWithProgress.file);
    };

    
    acceptedFiles.forEach((file) => {
        const fileWithProgress: FileWithProgress = { file, progress: 0, uploaded: false, error: false };
        uploadFile(fileWithProgress);
    });
    }, [anonymousUserId]);

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
