package com.sms.repository;

import com.sms.entity.TransportAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.Optional;

public interface TransportAllocationRepository extends JpaRepository<TransportAllocation, Long>, JpaSpecificationExecutor<TransportAllocation> {
    Optional<TransportAllocation> findByStudentId(Long studentId);
    Optional<TransportAllocation> findByStudentUserEmail(String email);
    boolean existsByStudentId(Long studentId);
}
