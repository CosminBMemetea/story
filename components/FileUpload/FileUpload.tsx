'use client';
import React, { useCallback, useState, useContext } from 'react';

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

//   const onDrop = useCallback( (acceptedFiles: File[]) => {
//     const uploadFile = async (fileWithProgress: FileWithProgress) => {
//       console.log(anonymousUserId);
//       if (anonymousUserId) {
//         const formData = new FormData();
//         console.log(fileWithProgress.file);
//         formData.append('photo', fileWithProgress.file);
//         formData.append('anonymousUserId', anonymousUserId);

//         // const path = fileWithProgress.file.path;
//         const { file } = fileWithProgress;
//         const fileLocation = file.webkitRelativePath || 'Unknown';
// // first needs to be loaded!!! TODO via multer or something elese please add the correct and complete code here 
//         console.log(`File location: ${fileLocation}`);
//            EXIF.getData(fileLocation, function(exifData: any) {
//     // Do something with the exifData
//             console.log(exifData);
//            });

//         // Configurația request-ului
//         const fetchConfig = {
//           method: 'POST',
//           body: formData, // Body-ul este formData, fără 'Content-Type' setat manual
//         };

//         // Adresă URL spre API-ul de încărcare, ajustează conform setup-ului tău
//         const uploadUrl = 'http://localhost:3001/api/welcome'; // Asigură-te că este corectă adresa

//         fetch(uploadUrl, fetchConfig)
//           .then(response => {
//             if (!response.ok) {
//               throw new Error('Network response was not ok');
//             }
//             return response.json();
//           })
//           .then(data => {
//             console.log(data); // Prelucrarea răspunsului
//             setFiles(currFiles => currFiles.map(fp => 
//               fp.file.name === fileWithProgress.file.name
//               ? { ...fp, uploaded: true, progress: 100 }
//               : fp
//             ));
//           })
//           .catch(error => {
//             console.error('Error uploading file:', error);
//             setFiles(currFiles => currFiles.map(fp =>
//               fp.file.name === fileWithProgress.file.name
//               ? { ...fp, error: true }
//               : fp
//             ));
//           });
//       } else {
//         console.log('No anonymousUserId found');
//         // Tratează cazul în care anonymousUserId nu este disponibil
//       }
//     };

//     const newFiles = acceptedFiles.filter(af => 
//       !files.some(f => 
//         f.file.name === af.name && 
//         f.file.size === af.size && 
//         f.file.lastModified === af.lastModified
//       )
//     ).map(file => ({
//       file,
//       progress: 0,
//       uploaded: false,
//       error: false
//     }));

//     if (newFiles.length > 0) {
//       setFiles(curr => [...curr, ...newFiles]);
//       newFiles.forEach(uploadFile);
//     }
//   }, [files, anonymousUserId]);

  
    const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadFile = async (fileWithProgress: FileWithProgress) => {
        if (anonymousUserId) {
        EXIF.getData(fileWithProgress.file, async function() {
            const exifData = EXIF.getAllTags(fileWithProgress.file);
            console.log(exifData); // Loghează datele EXIF pentru verificare

            // Extragerea țării din datele EXIF dacă este disponibilă
            const coordiates : Coordinates | null = parseExifData(exifData);

            console.log(coordiates);
       
         let address = null;

          if(coordiates && coordiates.latitude  && coordiates.latitude) {
            const locationDetails: LocationDetails | null = await getLocationDetails(coordiates.latitude, coordiates.longitude);

                if (locationDetails !== null) {
                // Procesează locationDetails doar dacă nu este null
                const locationDetailsString = JSON.stringify(locationDetails);
                address = locationDetailsString
                } else {
                // Gestionarea cazului în care locationDetails este null
                    console.log('Location details could not be retrieved');
                }
            }
        
         
            setFiles((currFiles) => currFiles.map((fp) => 
            fp.file.name === fileWithProgress.file.name ? { ...fp, country } : fp
            ));


            const payload = {
                file:  JSON.stringify(fileWithProgress.file),
                anonymousUserId: anonymousUserId,
                address: address
            };  
            console.log(payload);
            console.log('payload');

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

           
        });
        } else {
        console.log('No anonymousUserId found');
        // Gestionează cazul în care anonymousUserId nu este disponibil
        }
    };

    // Maparea și încărcarea fiecărui fișier acceptat
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
