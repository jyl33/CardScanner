// services/api/psaService.ts
import { PSAResponse } from '~/types/psaResponse';  // Move types to separate file

export class PSAAPIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'PSAAPIError';
  }
}

const getCertificationNumber = (url: string) => {
  const match = url.match(/\/cert\/(\d+)/);
  return match ? match[1] : null;  
};

const psaService = {
  async fetchCertification(scannedData: string): Promise<PSAResponse['PSACert'] | null> {
    if (!scannedData) return null;

    let certificationNumber : string | null = null;
    if (scannedData.includes("https://www.psacard.com/cert/")) {
        certificationNumber = getCertificationNumber(scannedData);
        console.log("certificationNumber", certificationNumber);
    } else {
        certificationNumber = scannedData;
        console.log("certificationNumber", certificationNumber);
    }

    try {
      const response = await fetch(
        `https://api.psacard.com/publicapi/cert/GetByCertNumber/${certificationNumber}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_PSA_ACCESS_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        console.log(response)
        throw new PSAAPIError(
          response.status,
          `PSA API error: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      const { PSACert } = result as PSAResponse;

      console.log(PSACert)

      return PSACert;
    } catch (error) {
      console.error('Error fetching PSA certification:', error);
      return null;
    }
  }
};

export default psaService;