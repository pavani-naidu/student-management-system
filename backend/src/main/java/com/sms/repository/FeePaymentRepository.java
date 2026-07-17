package com.sms.repository;

import com.sms.entity.FeePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeePaymentRepository extends JpaRepository<FeePayment, Long>, JpaSpecificationExecutor<FeePayment> {
    List<FeePayment> findByStudentIdOrderByPaymentDateDesc(Long studentId);
    boolean existsByTransactionId(String transactionId);
}
