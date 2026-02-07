@Auditable(
    action = "INCIDENT_CREATED",
    entityType = "INCIDENT",
    uploadToIpfs = true,
    
    // NEW FIELDS YOU CAN ADD:
    
    // 1. Severity level
    severity = "HIGH",  // "HIGH", "MEDIUM", "LOW", "INFO"
    
    // 2. Category/Group
    category = "INCIDENT_MANAGEMENT",  // for organizing audits
    
    // 3. Custom description (overrides auto-generated)
    description = "Created new incident from citizen report",
    
    // 4. Whether to log method parameters
    logParameters = true,  // log @RequestParam, @PathVariable, etc
    
    // 5. Whether to log return value
    logResult = true,  // log the response/return value
    
    // 6. Skip audit if exception occurs
    skipOnException = false,  // true = don't audit failed operations
    
    // 7. Mark if requires approval
    requiresApproval = false,  // true = flag for review
    
    // 8. Add tags for filtering/searching
    tags = {"citizen-report", "urgent"},
    
    // 9. Async timeout (milliseconds)
    asyncTimeout = 30000,  // 30 seconds
    
    // 10. Correlation ID for linking related audits
    correlationGroup = "INCIDENT_WORKFLOW"  // links multiple audits
)
@PostMapping("/incidents")
public IncidentResponse createIncident(@RequestBody CreateIncidentRequest req) { ... }