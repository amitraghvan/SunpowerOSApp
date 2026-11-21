# SOLAROS ERP — OBJECT STORAGE INTEGRATION
## MinIO Presigned URLs, Direct Browser Upload & Signed Retrieval

---

## 1. Storage Architecture

SolarOS uses S3-compatible object storage (MinIO locally, AWS S3 / Google Cloud Storage in production).
Large binary files (site survey photos, drone orthomosaic maps, electrical single-line diagrams, engineering CAD files) must never stream through application server RAM.

---

## 2. Bucket Taxonomy

Configured in `@solaros/config` (`STORAGE_BUCKETS`):
- `solaros-documents`: Formal PDF contracts, invoices, subsidy sanction letters.
- `solaros-surveys`: Field inspection photos, roof azimuth compass photos, switchboard meters.
- `solaros-assets`: Solar module datasheets, inverter manuals, company branding.

---

## 3. Upload & Retrieval Sequence

```mermaid
sequenceDiagram
    participant Browser as Web Browser / Technician Mobile
    participant API as SolarOS API Server
    participant MinIO as MinIO S3 Object Storage
    participant DB as PostgreSQL Database

    Browser->>API: POST /surveys/:id/photos/upload-url {fileName, category}
    API->>API: Generate object key: surveys/{orgId}/{surveyId}/{timestamp}-{file}
    API->>MinIO: presignedPutObject(bucket, objectKey, 900s)
    MinIO-->>API: Presigned PUT URL
    API-->>Browser: {uploadUrl, objectKey}

    Browser->>MinIO: HTTP PUT {uploadUrl} with Binary Image
    MinIO-->>Browser: HTTP 200 OK

    Browser->>API: POST /surveys/:id/photos/confirm {objectKey, category, fileSize}
    API->>DB: INSERT INTO survey_photos (...)
    DB-->>API: Created Record
    API-->>Browser: HTTP 201 Created

    Note over Browser,MinIO: Retrieval with Signed Expiry
    Browser->>API: GET /surveys/:id/photos
    API->>MinIO: presignedGetObject(bucket, objectKey, 3600s)
    MinIO-->>API: Presigned GET URL
    API-->>Browser: Photos array with downloadUrl
```
