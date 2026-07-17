package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.FeePaymentDTO;
import com.sms.dto.MyFeesResponse;
import com.sms.entity.FeePayment;
import com.sms.entity.Student;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.StudentRepository;
import com.sms.service.FeePaymentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fees")
@RequiredArgsConstructor
@Tag(name = "Fees", description = "Fees Management endpoints")
public class FeePaymentController {

    private final FeePaymentService feePaymentService;
    private final StudentRepository studentRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<FeePaymentDTO>>> search(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) String rollNumber,
            @RequestParam(required = false) String feeType,
            @RequestParam(required = false) FeePayment.Status status
    ) {
        List<FeePaymentDTO> result = feePaymentService.search(studentId, rollNumber, feeType, status);
        return ResponseEntity.ok(ApiResponse.success("Fee payments fetched successfully", result));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    public ResponseEntity<ApiResponse<FeePaymentDTO>> create(@Valid @RequestBody FeePaymentDTO dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isStudent = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"));
        if (isStudent) {
            Student student = studentRepository.findByUserEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + email));
            dto.setStudentId(student.getId());
        }
        FeePaymentDTO result = feePaymentService.createPayment(dto);
        return ResponseEntity.ok(ApiResponse.success("Fee payment recorded successfully", result));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FeePaymentDTO>> updateStatus(
            @PathVariable Long id,
            @RequestParam FeePayment.Status status
    ) {
        FeePaymentDTO result = feePaymentService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Fee payment status updated successfully", result));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<MyFeesResponse>> getMyFees() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        MyFeesResponse response = feePaymentService.getMyFees(email);
        return ResponseEntity.ok(ApiResponse.success("My fee status and history fetched successfully", response));
    }
}
