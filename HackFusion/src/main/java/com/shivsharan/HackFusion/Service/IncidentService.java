package com.shivsharan.HackFusion.Service;

import com.shivsharan.HackFusion.Annotation.Auditable;
import com.shivsharan.HackFusion.Entity.Incident;
import com.shivsharan.HackFusion.Entity.IncidentStatus;
import com.shivsharan.HackFusion.Repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;

    /**
     * Create incident - automatically audited
     */
    @Auditable(
            action = "INCIDENT_CREATED",
            entityType = "INCIDENT",
            uploadToIpfs = true
    )
    @Transactional
    public Incident createIncident(Incident incident) {
        // Your business logic
        return incidentRepository.save(incident);

        // No manual audit code needed!
        // AOP interceptor handles it automatically
    }

    /**
     * Update status - automatically audited
     */
    @Auditable(
            action = "STATUS_CHANGED",
            entityType = "INCIDENT",
            uploadToIpfs = true
    )
    @Transactional
    public Incident updateStatus(Long incidentId, String newStatus) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Not found"));

        incident.setStatus(IncidentStatus.valueOf(newStatus));
        return incidentRepository.save(incident);

        // Automatically creates audit log + uploads to IPFS!
    }

    /**
     * Assign to field worker - automatically audited
     */
    @Auditable(
            action = "INCIDENT_ASSIGNED",
            entityType = "INCIDENT",
            uploadToIpfs = true
    )
    @Transactional
    public Incident assignToWorker(Long incidentId, Long workerId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Not found"));

        incident.setAssignedTo(workerId);
        return incidentRepository.save(incident);
    }
}