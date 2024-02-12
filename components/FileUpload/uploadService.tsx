
// import { exec } from 'child_process';
import axios from 'axios';
import { exec } from 'child_process';
// import fs from 'fs';

// import admin from 'firebase-admin';
// import serviceAccount from '../database/nomad-nexus-firebase-adminsdk-h9hht-436e79a8b0.json';



// const execPromise = promisify(exec);


interface ExifData {
  latitude?: number;
  longitude?: number;
}

interface LocationDetails {
  address: {
    country?: string;
    country_code?: string;
  };
}

const parseExifData = (exifString: string): ExifData => {
  const exifLines = exifString.split('\n');
  let latitude: number | undefined, longitude: number | undefined;

  exifLines.forEach((line) => {
    if (line.includes('GPS Latitude')) {
      latitude = dmsToDecimal(line.split(': ')[1].trim()) ?? undefined;
    }
    if (line.includes('GPS Longitude')) {
      longitude = dmsToDecimal(line.split(': ')[1].trim()) ?? undefined;
    }
  });

  return { latitude, longitude };
};

const dmsToDecimal = (dms: string): number | undefined => {
  const parts = dms.match(/(\d+) deg (\d+)' ([\d.]+)"? ([NSEW])/);
  if (!parts) return undefined;

  const degrees = parseFloat(parts[1]);
  const minutes = parseFloat(parts[2]);
  const seconds = parseFloat(parts[3]);
  const direction = parts[4];

  let decimal = degrees + minutes / 60 + seconds / 3600;
  if (direction === 'S' || direction === 'W') decimal *= -1;
  return decimal;
};

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

const { exiftool } = require('exiftool-vendored');

async function getGPSCoordinates(uploadedFilePath) {
  const tool = await exiftool();

  try {
    const tags = await tool.read(uploadedFilePath);
    const latitude = tags.GPSLatitude;
    const longitude = tags.GPSLongitude;
    const latitudeRef = tags.GPSLatitudeRef;
    const longitudeRef = tags.GPSLongitudeRef;

    const finalLatitude = `${latitude} ${latitudeRef}`;
    const finalLongitude = `${longitude} ${longitudeRef}`;

    console.log(`Latitude: ${finalLatitude}`);
    console.log(`Longitude: ${finalLongitude}`);
  } catch (error) {
    console.error(`Error reading metadata: ${error}`);
  } finally {
    await tool.end();
  }
}


export async function processAndSaveFileData(uploadedFilePath: string, anonymousUserId: string, filename: string): Promise<void> {
  try {
    // if (!admin.apps.length) {
    //     admin.initializeApp({ credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)});
    // }
    // const db = admin.firestore();
    // console.log(db);

    
    const { stdout, stderr } = exec(`exiftool -c \"%d deg %d' %.2f\" ${uploadedFilePath}`);
    console.log("Here we are");

    if (stderr || !stdout) throw new Error(`Error reading EXIF data: ${stderr}`);

    // const exifData: ExifData = parseExifData(stdout);
    // if (!exifData) throw new Error('Unable to parse EXIF data');
    // if(!exifData.latitude || !exifData.longitude) throw new Error('Unable Latitude or Longitude');
    // const locationDetails: LocationDetails | null = await getLocationDetails(exifData.latitude, exifData.longitude);
    // if (!locationDetails) throw new Error('Unable to fetch location details');
    // console.log(locationDetails);
        // const userDocRef = db.collection('photos').doc(anonymousUserId);
        // const docSnapshot = await userDocRef.get();
        // let userData = docSnapshot.exists ? docSnapshot.data() : {};
        // if(!userData){
        //     throw new Error('Data not found for the given user.');
        // }
        // userData[filename] = {
        // filename,
        // ...exifData,
        // ...locationDetails,
        // };

        // await userDocRef.set(userData, { merge: true });

        // fs.unlink(uploadedFilePath, (err) => {
        // if (err) console.error('Error deleting file:', err);
        // });

        // setTimeout(async () => {
        // try {
        //     await userDocRef.update({ [filename]: admin.firestore.FieldValue.delete() });
        // } catch (error) {
        //     console.error(`Error deleting data for file ${filename} of user ${anonymousUserId}:`, error);
        // }
        // }, 5 * 60 * 1000); // 5 minutes
    
    } catch (error) {
        console.error('Error processing file:', error);
        throw error; // Propagă eroarea pentru a fi tratată mai sus în lanțul de promisiuni
    }


}

