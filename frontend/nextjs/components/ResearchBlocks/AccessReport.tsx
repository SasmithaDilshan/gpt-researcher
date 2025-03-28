import React from 'react';
import axios from 'axios';
import { clientCredentials } from 'axios-oauth-client';

interface AccessTokenResponse {
  access_token: string;
}
interface AccessReportProps {
  accessData: {
    pdf?: string;
    docx?: string;
    json?: string;
  };
  chatBoxSettings: {
    report_type?: string;
  };
  report: string;
}

const AccessReport: React.FC<AccessReportProps> = ({ accessData, chatBoxSettings }) => {
  const fetchReport = async (dataType: 'pdf' | 'docx' | 'json') => {
    try {
      // Early return if path is not available
      if (!accessData?.[dataType]) {
        console.warn(`No ${dataType} path provided`);
        return;
      }

      const filePath = accessData[dataType] as string;
      const sanitizedFilePath = filePath.startsWith('outputs/') ? filePath.replace('outputs/', '') : filePath;
      const config = await fetch('/config.json').then((response) => response.json());
      const getClientCredentials = clientCredentials(
        axios.create(),
        config.CHOREO_GPT_RESEARCHER_CONNECTION_TOKENURL,
        config.CHOREO_GPT_RESEARCHER_CONNECTION_CONSUMERKEY,
        config.CHOREO_GPT_RESEARCHER_CONNECTION_CONSUMERSECRET
      );

      const auth: AccessTokenResponse = await getClientCredentials('OPTIONAL_SCOPES');
      const accessToken: string = auth.access_token;
      // Construct the access URL with the access token
      const accessUrl = `${config.CHOREO_GPT_RESEARCHER_REST_SERVICEURL}/${sanitizedFilePath}`;
      // Fetch the report from the backend
      const response = await axios.get(accessUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'blob', // Ensure the response is treated as a binary file
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Failed to fetch ${dataType} report: ${response.statusText}`);
      }

      // Create a temporary URL for the file
      console.log('response', response);
      const fileBlob = response.data;
      const fileURL = URL.createObjectURL(fileBlob);

      // Trigger download or open the file in a new tab
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = `report.${dataType}`; // Set the file name
      link.target = '_blank';
      link.click();

      // Revoke the object URL after use to free up memory
      URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error(`Error fetching ${dataType} report:`, error);
    }
  };

  // Safety check for accessData
  if (!accessData || typeof accessData !== 'object') {
    return null;
  }

  return (
    <div className="flex justify-center mt-4">
          <button
        onClick={() => fetchReport('pdf')}
        className="bg-purple-500 text-white active:bg-purple-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150">
        View as PDF
      </button>
      <button
        onClick={() => fetchReport('docx')}
        className="bg-purple-500 text-white active:bg-purple-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150">
        Download DocX
      </button>
      {chatBoxSettings?.report_type === 'research_report' && (
        <button
          onClick={() => fetchReport('json')}
          className="bg-purple-500 text-white active:bg-purple-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150">
          Download Logs
        </button>
      )}
    </div>
  );
};

export default AccessReport;