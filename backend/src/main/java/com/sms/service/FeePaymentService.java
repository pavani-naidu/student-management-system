package com.sms.service;

import com.sms.dto.FeePaymentDTO;
import com.sms.dto.MyFeesResponse;
import com.sms.entity.FeePayment;
import com.sms.entity.Student;
import com.sms.exception.DuplicateResourceException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.FeePaymentRepository;
import com.sms.repository.StudentRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeePaymentService {

    private final FeePaymentRepository feePaymentRepository;
    private final StudentRepository studentRepository;

    @Transactional(readOnly = true)
    public List<FeePaymentDTO> search(Long studentId, String rollNumber, String feeType, FeePayment.Status status) {
        Specification<FeePayment> spec = (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (studentId != null) {
                predicates.add(cb.equal(root.get("student").get("id"), studentId));
            }
            if (rollNumber != null && !rollNumber.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("student").get("rollNumber")), rollNumber.trim().toLowerCase()));
            }
            if (feeType != null && !feeType.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("feeType")), feeType.trim().toLowerCase()));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return feePaymentRepository.findAll(spec).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FeePaymentDTO createPayment(FeePaymentDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + dto.getStudentId()));

        String txId = dto.getTransactionId();
        if (txId == null || txId.trim().isEmpty()) {
            txId = "TXN" + System.currentTimeMillis();
        } else if (feePaymentRepository.existsByTransactionId(txId)) {
            throw new DuplicateResourceException("Transaction ID already exists: " + txId);
        }

        FeePayment payment = FeePayment.builder()
                .student(student)
                .amount(dto.getAmount())
                .paymentDate(dto.getPaymentDate() != null ? dto.getPaymentDate() : LocalDate.now())
                .feeType(dto.getFeeType())
                .paymentMethod(dto.getPaymentMethod())
                .status(dto.getStatus() != null ? dto.getStatus() : FeePayment.Status.PENDING)
                .transactionId(txId)
                .remarks(dto.getRemarks())
                .build();

        FeePayment saved = feePaymentRepository.save(payment);
        return toDto(saved);
    }

    @Transactional
    public FeePaymentDTO updateStatus(Long id, FeePayment.Status status) {
        FeePayment payment = feePaymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee payment not found with ID: " + id));

        payment.setStatus(status);
        FeePayment updated = feePaymentRepository.save(payment);
        return toDto(updated);
    }

    @Transactional(readOnly = true)
    public MyFeesResponse getMyFees(String email) {
        Student student = studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user: " + email));

        List<FeePayment> payments = feePaymentRepository.findByStudentIdOrderByPaymentDateDesc(student.getId());

        double totalPaid = payments.stream()
                .filter(p -> p.getStatus() == FeePayment.Status.PAID)
                .mapToDouble(FeePayment::getAmount)
                .sum();

        double totalPending = payments.stream()
                .filter(p -> p.getStatus() == FeePayment.Status.PENDING)
                .mapToDouble(FeePayment::getAmount)
                .sum();

        double totalOutstanding = 5000.0 - totalPaid;
        if (totalOutstanding < 0) {
            totalOutstanding = 0.0;
        }

        List<FeePaymentDTO> history = payments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return MyFeesResponse.builder()
                .totalPaid(totalPaid)
                .totalPending(totalPending)
                .totalOutstanding(totalOutstanding)
                .history(history)
                .build();
    }

    public FeePaymentDTO toDto(FeePayment payment) {
        return FeePaymentDTO.builder()
                .id(payment.getId())
                .studentId(payment.getStudent().getId())
                .studentRollNumber(payment.getStudent().getRollNumber())
                .studentFirstName(payment.getStudent().getFirstName())
                .studentLastName(payment.getStudent().getLastName())
                .amount(payment.getAmount())
                .paymentDate(payment.getPaymentDate())
                .feeType(payment.getFeeType())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .remarks(payment.getRemarks())
                .build();
    }
}
