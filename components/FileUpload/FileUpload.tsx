'use client';
import React, { useCallback, useState, useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import axios, { CancelTokenSource } from 'axios';
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


    const uploadFile = async (fileWithProgress: FileWithProgress) => {
    const reader = new FileReader();

    reader.onload = async (event: ProgressEvent<FileReader>) => {
        if (event.target?.result && typeof event.target.result === 'object') {
        const tags = ExifReader.load(event.target.result);
        console.log(tags);
        const coordinates = parseExifDataSimple(tags); // Utilizează funcția parseExifData definită anterior pentru a extrage coordonatele
        console.log("Coordinates:", coordinates);

        if (coordinates) {
            try {
            const locationDetails = await getLocationDetails(coordinates);
            console.log("Location Details:", locationDetails);
            if (locationDetails) {
                const payload = {
                anonymousUserId: anonymousUserId,
                file: fileWithProgress.file.name, // Presupunem că acesta este modul în care dorim să trimitem referința la fișier
                address: JSON.stringify({
                    address: {
                    country: locationDetails.address.country,
                    country_code: locationDetails.address.country_code,
                    },
                    lat: coordinates.latitude,
                    lon: coordinates.longitude
                }),
                };

                // Înlocuiește URL-ul cu endpoint-ul corect al serverului tău
                fetch('https://nomad-nexus-api.vercel.app/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                })
                .then(response => response.json())
                .then(data => {
                console.log('Răspuns de la server:', data);
                // Actualizează UI-ul sau starea pe baza răspunsului, dacă este necesar
                })
                .catch(error => {
                console.error('Eroare la încărcarea fișierului:', error);
                });
            }
            } catch (error) {
            console.error('Eroare la obținerea detaliilor locației:', error);
            }
        }
        }
    };

    reader.onerror = (error) => {
        console.error('Eroare la citirea fișierului:', error);
    };

    // Începe citirea fișierului ca un ArrayBuffer pentru a putea fi procesat de ExifReader
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
