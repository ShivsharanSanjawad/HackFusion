# Audit System Documentation

## Overview
Your HackFusion application now has a comprehensive audit system that tracks all important actions, including file uploads. This system integrates with IPFS (Pinata) for blockchain-based immutable audit trails.

---

## Architecture

```
Request to @Auditable Method
    ↓
AuditAspect (Interceptor)
    ↓ (Captures metadata, user info, IP address)
AuditService.logEvent()
    ↓
AuditLog Entity saved to Database
    ↓ (Asynchronously)
IpfsAuditService.uploadToIpfsAsync()
    ↓
PinataService (uploads to IPFS)
    ↓
CID stored back in AuditLog.ipfsCid
```

---

## Components

### 1. **@Auditable Annotation**
- **Location**: `Annotation/Auditable.java`
- **Purpose**: Marks methods that should be audited
- **Parameters**:
  - `action` (String): What action was performed (e.g., "FILE_UPLOADED", "INCIDENT_CREATED")
  - `entityType` (String): Type of entity being modified (e.g., "DOCUMENT", "INCIDENT")
  - `uploadToIpfs` (boolean): Whether to upload audit record to blockchain (default: true)

**Example Usage**:
```java
@Auditable(
    action = "FILE_UPLOADED",
    entityType = "DOCUMENT",
    uploadToIpfs = true
)
@PostMapping("/upload")
public String uploadFile(@RequestParam("file") MultipartFile file) { ... }
```

### 2. **AuditAspect** (Interceptor)
- **Location**: `Aspect/AuditAspect.java`
- **What it does**:
  - Intercepts all methods marked with `@Auditable`
  - Captures current user info (from `UserContext`)
  - Captures HTTP request info (IP address, user agent)
  - Extracts method parameters and return values
  - Converts results to JSON for state tracking
  - Handles both success and failure cases

### 3. **AuditService**
- **Location**: `Service/AuditService.java`
- **Responsibilities**:
  - Calculates SHA-256 checksum for each audit log (blockchain-style chaining)
  - Saves AuditLog to database
  - Triggers async IPFS upload via `IpfsAuditService`
  - Handles any audit logging failures gracefully (won't break main app flow)

**Checksum Calculation**:
```
checksum = SHA256(previousChecksum | eventId | timestamp | action | entityId | newState)
```
This creates an immutable chain - each audit log references the previous one.

### 4. **IpfsAuditService**
- **Location**: `Service/IpfsAuditService.java`
- **What it does**:
  - Runs asynchronously (won't block the request)
  - Converts AuditLog entity to JSON
  - Uploads JSON to Pinata/IPFS via `PinataService`
  - Updates `AuditLog.ipfsCid` with the returned CID
  - Updates `AuditLog.ipfsUploadStatus` (SUCCESS/FAILED)
  - Records `ipfsUploadedAt` timestamp

### 5. **PinataService**
- **Location**: `Service/PinataService.java`
- **What it does**:
  - Makes HTTP requests to Pinata API
  - Sends files to IPFS via Pinata
  - Returns Content Identifier (CID)

**Configuration Required** (`application.properties`):
```properties
pinata.api.url=https://api.pinata.cloud/pinning/pinFileToIPFS
pinata.api.jwt=YOUR_PINATA_JWT_TOKEN
```

### 6. **AuditLog Entity**
- **Location**: `Entity/AuditLog.java`
- **Key Fields**:
  - `eventId`: UUID for the event
  - `timestamp`: When it happened
  - `actorUsername`, `actorType`, `actorId`: Who did it
  - `entityType`, `entityId`: What was changed
  - `action`: What action was performed
  - `oldState`, `newState`: JSON snapshots of state changes
  - `ipAddress`: Source IP for security
  - `checksum`, `previousChecksum`: Blockchain-style chaining
  - `ipfsCid`: Content Identifier from IPFS
  - `ipfsUploadStatus`: PENDING, SUCCESS, or FAILED
  - `ipfsUploadedAt`: When uploaded to blockchain

---

## Audit Flow for File Upload Example

**Endpoint**: `POST /api/ipfs/upload`

### Step 1: Request Arrives
```
User uploads file to /api/ipfs/upload
```

### Step 2: Aspect Intercepts
```java
@Around("@annotation(auditable)")
public Object auditMethod(ProceedingJoinPoint joinPoint, Auditable auditable) {
    // Capture user from UserContext
    // Capture HTTP request info (IP address)
    // Create AuditEvent with metadata
    
    // Execute the actual upload
    Object result = joinPoint.proceed();
    
    // CID returned from uploadFile() is stored in AuditEvent.newState
    
    // Log the event
    auditService.logEvent(event);
    
    return result;
}
```

### Step 3: AuditService Processes
```
1. Get previous audit log's checksum
2. Calculate new SHA-256 checksum (includes previous)
3. Save AuditLog to database with:
   - actorUsername, timestamp, ipAddress
   - action="FILE_UPLOADED", entityType="DOCUMENT"
   - newState = JSON of file metadata
   - ipfsUploadStatus = "PENDING"
4. Trigger async upload: ipfsAuditService.uploadToIpfsAsync(savedAuditLog)
```

### Step 4: Async IPFS Upload
```
(Happens in background thread, won't block user's request)

1. Convert AuditLog to JSON
2. Upload to Pinata via WebClient
3. Receive CID from IPFS
4. Update database:
   - auditLog.ipfsCid = "Qm..."
   - auditLog.ipfsUploadStatus = "SUCCESS"
   - auditLog.ipfsUploadedAt = now()
```

### Step 5: User Gets Response
```
HTTP 200 OK with CID of the uploaded file
(Audit log uploaded to blockchain in the background)
```

---

## Configuration Added

### In `Config/config.java`:

```java
@EnableAspectJAutoProxy(proxyTargetClass = true)  // Enable aspect proxying
@EnableAsync                                       // Enable async processing
```

**Beans Created**:
- `ObjectMapper`: Used by AuditService and IpfsAuditService for JSON serialization
- `WebClient`: Used by PinataService for HTTP requests

---

## Required application.properties

```properties
# Pinata/IPFS Configuration
pinata.api.url=https://api.pinata.cloud/pinning/pinFileToIPFS
pinata.api.jwt=YOUR_PINATA_JWT_TOKEN

# Async Configuration (optional, uses defaults)
spring.task.execution.pool.core-size=2
spring.task.execution.pool.max-size=5
spring.task.execution.pool.queue-capacity=100
spring.task.execution.thread-name-prefix=audit-async-

# Database for storing audit logs
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
```

---

## How to Use in Other Controllers

To audit any method, simply add the `@Auditable` annotation:

```java
@Auditable(
    action = "INCIDENT_CREATED",
    entityType = "INCIDENT",
    uploadToIpfs = true
)
@PostMapping("/incidents")
public IncidentResponse createIncident(@RequestBody CreateIncidentRequest request) {
    // Your code here
    return incidentService.create(request);
}
```

The aspect will automatically:
1. Capture user context
2. Capture HTTP request info
3. Execute your method
4. Log the result to database
5. Upload to IPFS asynchronously

---

## Database Schema

The `audit_log` table stores:
```sql
CREATE TABLE audit_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id VARCHAR(255) UNIQUE,
    timestamp DATETIME,
    actor_id BIGINT,
    actor_username VARCHAR(255),
    actor_type VARCHAR(50),
    entity_type VARCHAR(100),
    entity_id BIGINT,
    action VARCHAR(100),
    old_state LONGTEXT,
    new_state LONGTEXT,
    description TEXT,
    ip_address VARCHAR(50),
    checksum VARCHAR(64),
    previous_checksum VARCHAR(64),
    ipfs_cid VARCHAR(255),
    ipfs_upload_status VARCHAR(20),
    ipfs_uploaded_at DATETIME
);
```

---

## Troubleshooting

### Aspect not working?
- Verify `@EnableAspectJAutoProxy` is in config.java ✓
- Ensure method is not private (aspects don't proxy private methods)
- Check that `@Auditable` annotation is on the method

### IPFS upload failing?
- Check `pinata.api.jwt` in application.properties
- Verify Pinata API endpoint is accessible
- Check logs in `IpfsAuditService` (runs async, so failures don't block requests)
- CID will remain null if upload fails, but `ipfsUploadStatus` will be "FAILED"

### Can see audit log but not IPFS CID?
- The async upload might still be in progress
- Check `ipfsUploadStatus` field - if "PENDING", it's queued
- Wait a moment and check again

### Checksum/previous checksum issues?
- These are calculated automatically
- "GENESIS" is the initial previous checksum for the first audit log
- Each subsequent log chains to the previous one

---

## Security Considerations

1. **Immutable Audit Trail**: Stored on blockchain via IPFS
2. **Checksums**: Create tamper-evident chain
3. **IP Tracking**: Records source of action
4. **User Context**: Captures who performed action
5. **State Changes**: Tracks before/after values
6. **Async Processing**: IPFS upload doesn't block main request (fail-safe)

---

## Next Steps

1. ✓ Enable AuditAspect proxying - **DONE**
2. ✓ Enable async IPFS uploads - **DONE**
3. ✓ Add ObjectMapper bean - **DONE**
4. ✓ Add WebClient bean - **DONE**
5. ✓ Add @Auditable to IpfsController - **DONE**
6. TODO: Add Pinata credentials to application.properties
7. TODO: Add @Auditable to other important endpoints (incident creation, status change, assignment, etc.)
8. TODO: Monitor audit_log table to verify logs are being written

---

## Questions?

The audit system is now fully integrated. Every file upload will be tracked with:
- Who uploaded it (username, IP)
- When (timestamp)
- What file (entity info)
- Return value (CID)
- Immutable record on blockchain (IPFS)
