package com.sms.repository;

import com.sms.entity.HostelAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.Optional;

public interface HostelAllocationRepository extends JpaRepository<HostelAllocation, Long>, JpaSpecificationExecutor<HostelAllocation> {
    Optional<HostelAllocation> findByStudentId(Long studentId);
    Optional<HostelAllocation> findByStudentUserEmail(String email);
    boolean existsByStudentId(Long studentId);
}
