/**
 * Document API Client
 * Client-side API functions for document operations
 */

import { api } from "@/src/lib/api";
import { CloudinaryUploadResult } from "./cloudinary-api";


export interface DocumentPayload {
  schoolId: string;
  documentType: 'CAC_DOCUMENT' | 'SCHOOL_ID' | 'OTHER';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

export interface Document {
  id: string;
  schoolId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  isVerified: boolean;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Upload school documents
 */
export const uploadSchoolDocuments = async (
  schoolId: string,
  cloudinaryResults: CloudinaryUploadResult[]
): Promise<Document[]> => {
  try {
    const documents: DocumentPayload[] = cloudinaryResults.map(result => {
      const filenameFromPublicId =
        result.public_id.split('/').pop() + '.' + result.format;

      return {
        schoolId,
        documentType: determineDocumentType(filenameFromPublicId),
        fileName: filenameFromPublicId,
        fileUrl: result.secure_url,
        fileSize: result.bytes,
        mimeType: `${result.resource_type}/${result.format}`,
      };
    });

    const response = await api.post('/api/document/upload', { documents });
    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      alert(data.message || "Failed to save documents.");
      return [];
    }
  } catch (error) {
    console.error("Error uploading documents:", error);
    alert(error instanceof Error ? error.message : 'An error occurred');
    return [];
  }
};

/**
 * Determine document type based on filename
 */
function determineDocumentType(filename: string): 'CAC_DOCUMENT' | 'SCHOOL_ID' | 'OTHER' {
  const lowerFilename = filename.toLowerCase();

  if (lowerFilename.includes('cac') || lowerFilename.includes('certificate')) {
    return 'CAC_DOCUMENT';
  }

  if (lowerFilename.includes('id') || lowerFilename.includes('license')) {
    return 'SCHOOL_ID';
  }

  return 'OTHER';
}

/**
 * Get school documents
 */
export const fetchSchoolDocuments = async (schoolId: string): Promise<Document[]> => {
  try {
    const response = await api.get(`/api/documents?schoolId=${schoolId}`);
    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      alert(data.message || "Failed to fetch documents.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (documentId: string): Promise<boolean> => {
  try {
    const response = await api.delete(`/api/documents/${documentId}`);
    const data = await response.json();

    if (data.success) {
      return true;
    } else {
      alert(data.message || "Failed to delete document.");
      return false;
    }
  } catch (error) {
    console.error("Error deleting document:", error);
    alert(error instanceof Error ? error.message : 'An error occurred');
    return false;
  }
};